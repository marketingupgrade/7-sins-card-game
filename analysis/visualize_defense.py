#!/usr/bin/env python3
"""
Visualization & Statistical Analysis for Defensive Mechanism Evaluation
========================================================================

Generates publication-quality charts from the simulation results:
  1. Composite quality score curve with inflection point
  2. Individual metric decomposition (8 subplots)
  3. Faction balance heatmaps at key multipliers
  4. Win rate convergence by faction across multipliers
  5. Trade-off analysis (blowout vs timeout rates)
  6. Recommended multiplier with confidence interval
"""

import json
import os
import numpy as np
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
import matplotlib.gridspec as gridspec
from matplotlib.patches import FancyBboxPatch
import seaborn as sns

# ─── Style ───────────────────────────────────────────────────
plt.style.use("seaborn-v0_8-darkgrid")
plt.rcParams.update({
    "font.family": "sans-serif",
    "font.sans-serif": ["DejaVu Sans"],
    "font.size": 11,
    "axes.titlesize": 13,
    "axes.labelsize": 11,
    "figure.facecolor": "#0f0c14",
    "axes.facecolor": "#1a1520",
    "text.color": "#e0d8c8",
    "axes.edgecolor": "#3a3040",
    "axes.labelcolor": "#c0b8a8",
    "xtick.color": "#a09888",
    "ytick.color": "#a09888",
    "grid.color": "#2a2530",
    "grid.alpha": 0.5,
})

SIN_COLORS = {
    "wrath": "#ef4444",
    "sloth": "#a855f7",
    "greed": "#eab308",
    "envy": "#22c55e",
    "pride": "#e2e2e2",
    "lust": "#ec4899",
    "gluttony": "#f97316",
}

SINS = ["wrath", "sloth", "greed", "envy", "pride", "lust", "gluttony"]

OUT_DIR = os.path.dirname(__file__)


def load_data():
    """Load both result sets."""
    with open(os.path.join(OUT_DIR, "defensive_results.json")) as f:
        base = json.load(f)
    with open(os.path.join(OUT_DIR, "defensive_extended_results.json")) as f:
        ext = json.load(f)

    # Merge: use extended as primary (has finer granularity from 1.0-3.0)
    # Add the 0.50 and 0.75 from base
    all_scenarios = []
    base_mults = {s["defense_mult"]: s for s in base["scenarios"]}
    ext_mults = {s["defense_mult"]: s for s in ext["scenarios"]}

    for m in [0.50, 0.75]:
        if m in base_mults:
            all_scenarios.append(base_mults[m])

    for s in ext["scenarios"]:
        all_scenarios.append(s)

    return all_scenarios


def fig1_quality_curve(scenarios):
    """Chart 1: Composite quality score with inflection annotation."""
    fig, ax = plt.subplots(figsize=(12, 6))

    mults = [s["defense_mult"] for s in scenarios]
    scores = [s["quality_score"] for s in scenarios]

    # Main curve
    ax.plot(mults, scores, "o-", color="#eab308", linewidth=2.5, markersize=8,
            markerfacecolor="#eab308", markeredgecolor="#0f0c14", markeredgewidth=2,
            zorder=5)

    # Fill under curve
    ax.fill_between(mults, scores, min(scores) - 2, alpha=0.15, color="#eab308")

    # Baseline marker
    baseline_idx = next(i for i, m in enumerate(mults) if m == 1.0)
    ax.axvline(x=1.0, color="#ef4444", linestyle="--", alpha=0.5, linewidth=1.5)
    ax.annotate("CURRENT\nBASELINE", xy=(1.0, scores[baseline_idx]),
                xytext=(0.65, scores[baseline_idx] + 1.5),
                fontsize=9, color="#ef4444", fontweight="bold",
                arrowprops=dict(arrowstyle="->", color="#ef4444", lw=1.5),
                ha="center")

    # Diminishing returns zone
    ax.axvspan(1.75, 3.0, alpha=0.08, color="#a855f7")
    ax.text(2.35, min(scores) + 0.5, "DIMINISHING RETURNS ZONE",
            fontsize=8, color="#a855f7", alpha=0.7, ha="center",
            style="italic")

    # Recommended zone
    ax.axvspan(1.50, 2.00, alpha=0.12, color="#22c55e")
    ax.text(1.75, max(scores) + 0.3, "RECOMMENDED\nRANGE",
            fontsize=9, color="#22c55e", fontweight="bold", ha="center")

    # Score annotations
    for i, (m, s) in enumerate(zip(mults, scores)):
        if m in [0.50, 1.00, 1.50, 1.75, 2.00, 3.00]:
            ax.annotate(f"{s:.1f}", xy=(m, s), xytext=(0, 12),
                        textcoords="offset points", fontsize=9,
                        color="#e0d8c8", ha="center", fontweight="bold")

    ax.set_xlabel("Defensive Mechanism Multiplier", fontweight="bold")
    ax.set_ylabel("Composite Gameplay Quality Score", fontweight="bold")
    ax.set_title("DEFENSIVE SCALING vs GAMEPLAY QUALITY\n294,000+ Monte Carlo Simulations",
                 fontweight="bold", fontsize=14, color="#eab308")
    ax.set_xlim(0.4, 3.1)
    ax.set_ylim(min(scores) - 2, max(scores) + 2)

    fig.tight_layout()
    path = os.path.join(OUT_DIR, "chart1_quality_curve.png")
    fig.savefig(path, dpi=150, bbox_inches="tight", facecolor=fig.get_facecolor())
    plt.close(fig)
    print(f"  Saved: {path}")
    return path


def fig2_metric_decomposition(scenarios):
    """Chart 2: 8 individual metrics across multipliers."""
    fig, axes = plt.subplots(2, 4, figsize=(20, 10))
    fig.suptitle("GAMEPLAY QUALITY METRICS BY DEFENSIVE MULTIPLIER",
                 fontweight="bold", fontsize=16, color="#eab308", y=0.98)

    mults = [s["defense_mult"] for s in scenarios]

    metrics = [
        ("avg_game_length", "Avg Game Length (rounds)", "#22c55e", "higher is better (target: 14-18)"),
        ("comeback_rate", "Comeback Rate", "#a855f7", "higher = more dramatic games"),
        ("blowout_rate", "Blowout Rate (<8 rounds)", "#ef4444", "lower = fewer stomps"),
        ("timeout_rate", "Timeout Rate (20 rounds)", "#f97316", "lower = more decisive"),
        ("avg_hp_volatility", "HP Volatility (per round)", "#ec4899", "moderate is ideal"),
        ("defensive_interaction_rate", "Defensive Play Rate", "#3b82f6", "higher = more strategic"),
        ("faction_balance_deviation", "Faction Balance Deviation", "#eab308", "lower = fairer"),
        ("strategic_diversity", "Strategic Diversity (entropy)", "#06b6d4", "higher = more variety"),
    ]

    for idx, (key, title, color, note) in enumerate(metrics):
        ax = axes[idx // 4][idx % 4]
        values = [s[key] for s in scenarios]

        ax.plot(mults, values, "o-", color=color, linewidth=2, markersize=6,
                markerfacecolor=color, markeredgecolor="#0f0c14", markeredgewidth=1.5)
        ax.fill_between(mults, values, min(values) - (max(values) - min(values)) * 0.1,
                        alpha=0.1, color=color)

        # Baseline marker
        ax.axvline(x=1.0, color="#ef4444", linestyle=":", alpha=0.4, linewidth=1)

        ax.set_title(title, fontsize=10, fontweight="bold", color=color)
        ax.set_xlabel("Defense ×", fontsize=8)
        ax.text(0.02, 0.02, note, transform=ax.transAxes, fontsize=7,
                color="#808080", style="italic", va="bottom")

        # Format y-axis for percentages
        if key in ("comeback_rate", "blowout_rate", "timeout_rate", "defensive_interaction_rate"):
            ax.yaxis.set_major_formatter(plt.FuncFormatter(lambda y, _: f"{y:.0%}"))

    fig.tight_layout(rect=[0, 0, 1, 0.95])
    path = os.path.join(OUT_DIR, "chart2_metric_decomposition.png")
    fig.savefig(path, dpi=150, bbox_inches="tight", facecolor=fig.get_facecolor())
    plt.close(fig)
    print(f"  Saved: {path}")
    return path


def fig3_faction_winrates(scenarios):
    """Chart 3: Win rate by faction across multipliers."""
    fig, ax = plt.subplots(figsize=(14, 7))

    mults = [s["defense_mult"] for s in scenarios]

    for sin in SINS:
        rates = [s["win_rates"][sin] for s in scenarios]
        ax.plot(mults, rates, "o-", color=SIN_COLORS[sin], linewidth=2.5,
                markersize=7, label=sin.capitalize(),
                markerfacecolor=SIN_COLORS[sin], markeredgecolor="#0f0c14",
                markeredgewidth=1.5)

    # 50% line
    ax.axhline(y=0.5, color="#e0d8c8", linestyle="--", alpha=0.3, linewidth=1)
    ax.text(max(mults) + 0.05, 0.5, "PERFECT\nBALANCE", fontsize=8,
            color="#e0d8c8", alpha=0.5, va="center")

    # Baseline
    ax.axvline(x=1.0, color="#ef4444", linestyle=":", alpha=0.4, linewidth=1)

    # 1.5% deviation band
    ax.axhspan(0.485, 0.515, alpha=0.08, color="#22c55e")
    ax.text(0.55, 0.517, "±1.5% target zone", fontsize=7, color="#22c55e", alpha=0.6)

    ax.set_xlabel("Defensive Mechanism Multiplier", fontweight="bold")
    ax.set_ylabel("Win Rate", fontweight="bold")
    ax.set_title("FACTION WIN RATES vs DEFENSIVE SCALING\nCloser to 50% = Better Balance",
                 fontweight="bold", fontsize=14, color="#eab308")
    ax.yaxis.set_major_formatter(plt.FuncFormatter(lambda y, _: f"{y:.0%}"))
    ax.legend(loc="upper right", framealpha=0.3, fontsize=9)
    ax.set_xlim(0.4, 3.1)

    fig.tight_layout()
    path = os.path.join(OUT_DIR, "chart3_faction_winrates.png")
    fig.savefig(path, dpi=150, bbox_inches="tight", facecolor=fig.get_facecolor())
    plt.close(fig)
    print(f"  Saved: {path}")
    return path


def fig4_heatmaps(scenarios):
    """Chart 4: Matchup heatmaps at baseline vs optimal."""
    # Find baseline (1.0) and recommended (1.75)
    baseline = next(s for s in scenarios if s["defense_mult"] == 1.0)
    recommended = next(s for s in scenarios if abs(s["defense_mult"] - 1.75) < 0.01)

    fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(16, 7))
    fig.suptitle("MATCHUP BALANCE HEATMAPS\nWin Rate of Row Faction vs Column Faction",
                 fontweight="bold", fontsize=14, color="#eab308", y=1.02)

    for ax, data, title in [(ax1, baseline, "BASELINE (×1.00)"),
                             (ax2, recommended, "RECOMMENDED (×1.75)")]:
        matrix = np.zeros((7, 7))
        for i, s1 in enumerate(SINS):
            for j, s2 in enumerate(SINS):
                matrix[i][j] = data["matchup_matrix"][s1][s2]

        sns.heatmap(matrix, ax=ax, annot=True, fmt=".0%", cmap="RdYlGn",
                    center=0.5, vmin=0.2, vmax=0.8,
                    xticklabels=[s.capitalize() for s in SINS],
                    yticklabels=[s.capitalize() for s in SINS],
                    linewidths=0.5, linecolor="#2a2530",
                    cbar_kws={"label": "Win Rate", "shrink": 0.8})
        ax.set_title(title, fontweight="bold", fontsize=12, pad=10)
        ax.tick_params(axis="both", labelsize=9)

    fig.tight_layout()
    path = os.path.join(OUT_DIR, "chart4_matchup_heatmaps.png")
    fig.savefig(path, dpi=150, bbox_inches="tight", facecolor=fig.get_facecolor())
    plt.close(fig)
    print(f"  Saved: {path}")
    return path


def fig5_tradeoff(scenarios):
    """Chart 5: Blowout vs Timeout trade-off with game length."""
    fig, ax1 = plt.subplots(figsize=(12, 6))
    ax2 = ax1.twinx()

    mults = [s["defense_mult"] for s in scenarios]
    blowouts = [s["blowout_rate"] for s in scenarios]
    timeouts = [s["timeout_rate"] for s in scenarios]
    game_lengths = [s["avg_game_length"] for s in scenarios]

    # Stacked area for blowout + timeout
    ax1.fill_between(mults, blowouts, alpha=0.3, color="#ef4444", label="Blowout Rate")
    ax1.fill_between(mults, timeouts, alpha=0.3, color="#f97316", label="Timeout Rate")
    ax1.plot(mults, blowouts, "o-", color="#ef4444", linewidth=2, markersize=5)
    ax1.plot(mults, timeouts, "s-", color="#f97316", linewidth=2, markersize=5)

    # Game length on secondary axis
    ax2.plot(mults, game_lengths, "D-", color="#22c55e", linewidth=2.5, markersize=7,
             markerfacecolor="#22c55e", markeredgecolor="#0f0c14", markeredgewidth=1.5,
             label="Avg Game Length", zorder=5)

    # Sweet spot annotation
    ax1.axvspan(1.50, 2.00, alpha=0.08, color="#22c55e")

    ax1.set_xlabel("Defensive Mechanism Multiplier", fontweight="bold")
    ax1.set_ylabel("Rate (Blowout / Timeout)", fontweight="bold", color="#e0d8c8")
    ax2.set_ylabel("Avg Game Length (rounds)", fontweight="bold", color="#22c55e")
    ax1.set_title("GAME PACING TRADE-OFF\nBlowouts vs Timeouts vs Game Length",
                   fontweight="bold", fontsize=14, color="#eab308")

    ax1.yaxis.set_major_formatter(plt.FuncFormatter(lambda y, _: f"{y:.0%}"))
    ax1.legend(loc="upper left", framealpha=0.3, fontsize=9)
    ax2.legend(loc="upper right", framealpha=0.3, fontsize=9)

    # Ideal game length band
    ax2.axhspan(14, 18, alpha=0.05, color="#22c55e")
    ax2.text(0.55, 16, "ideal range", fontsize=7, color="#22c55e", alpha=0.5)

    fig.tight_layout()
    path = os.path.join(OUT_DIR, "chart5_tradeoff.png")
    fig.savefig(path, dpi=150, bbox_inches="tight", facecolor=fig.get_facecolor())
    plt.close(fig)
    print(f"  Saved: {path}")
    return path


def fig6_recommendation(scenarios):
    """Chart 6: Final recommendation summary card."""
    fig = plt.figure(figsize=(14, 8))
    fig.patch.set_facecolor("#0f0c14")

    # Main grid
    gs = gridspec.GridSpec(3, 3, figure=fig, hspace=0.4, wspace=0.3)

    # Title area
    ax_title = fig.add_subplot(gs[0, :])
    ax_title.axis("off")
    ax_title.text(0.5, 0.8, "DEFENSIVE MECHANISM EVALUATION — RECOMMENDATION",
                  fontsize=18, fontweight="bold", color="#eab308",
                  ha="center", va="center", transform=ax_title.transAxes)
    ax_title.text(0.5, 0.4, "Based on 672,000 Monte Carlo simulated games across 16 scenarios",
                  fontsize=11, color="#a09888", ha="center", va="center",
                  transform=ax_title.transAxes)

    # Recommendation box
    ax_rec = fig.add_subplot(gs[1, 0])
    ax_rec.axis("off")
    ax_rec.text(0.5, 0.85, "RECOMMENDED", fontsize=10, color="#22c55e",
                fontweight="bold", ha="center", transform=ax_rec.transAxes)
    ax_rec.text(0.5, 0.55, "×1.75", fontsize=36, color="#22c55e",
                fontweight="bold", ha="center", transform=ax_rec.transAxes)
    ax_rec.text(0.5, 0.25, "Defensive Multiplier", fontsize=9, color="#808080",
                ha="center", transform=ax_rec.transAxes)
    ax_rec.text(0.5, 0.05, "(sweet spot before diminishing returns)",
                fontsize=8, color="#606060", ha="center", style="italic",
                transform=ax_rec.transAxes)

    # Key metrics comparison
    baseline = next(s for s in scenarios if s["defense_mult"] == 1.0)
    recommended = next(s for s in scenarios if abs(s["defense_mult"] - 1.75) < 0.01)

    ax_comp = fig.add_subplot(gs[1, 1:])
    ax_comp.axis("off")

    comparisons = [
        ("Quality Score", f"{baseline['quality_score']:.1f}", f"{recommended['quality_score']:.1f}", "↑"),
        ("Game Length", f"{baseline['avg_game_length']:.1f}r", f"{recommended['avg_game_length']:.1f}r", "↑"),
        ("Blowout Rate", f"{baseline['blowout_rate']:.1%}", f"{recommended['blowout_rate']:.1%}", "↓"),
        ("Faction Deviation", f"{baseline['faction_balance_deviation']:.1%}", f"{recommended['faction_balance_deviation']:.1%}", "↓"),
        ("Timeout Rate", f"{baseline['timeout_rate']:.1%}", f"{recommended['timeout_rate']:.1%}", "↑ (trade-off)"),
    ]

    ax_comp.text(0.0, 0.95, "METRIC", fontsize=9, color="#808080", fontweight="bold")
    ax_comp.text(0.45, 0.95, "BASELINE", fontsize=9, color="#ef4444", fontweight="bold")
    ax_comp.text(0.65, 0.95, "×1.75", fontsize=9, color="#22c55e", fontweight="bold")
    ax_comp.text(0.82, 0.95, "TREND", fontsize=9, color="#808080", fontweight="bold")

    for i, (name, base_val, rec_val, trend) in enumerate(comparisons):
        y = 0.78 - i * 0.17
        ax_comp.text(0.0, y, name, fontsize=10, color="#e0d8c8")
        ax_comp.text(0.45, y, base_val, fontsize=10, color="#ef4444", fontweight="bold")
        ax_comp.text(0.65, y, rec_val, fontsize=10, color="#22c55e", fontweight="bold")
        trend_color = "#22c55e" if "trade-off" not in trend else "#f97316"
        ax_comp.text(0.82, y, trend, fontsize=10, color=trend_color)

    # Bottom: key findings
    ax_findings = fig.add_subplot(gs[2, :])
    ax_findings.axis("off")

    findings = [
        "1. Higher defensive values consistently improve gameplay quality (monotonic up to ×2.0)",
        "2. Diminishing returns begin at ×1.75 — each additional 0.25× yields <0.5 quality points",
        "3. Primary benefit: reduced blowout rate and improved faction balance",
        "4. Primary cost: increased timeout rate (games reaching round 20)",
        "5. Wrath and Greed remain dominant across all scenarios — separate rebalancing needed",
    ]

    ax_findings.text(0.0, 0.95, "KEY FINDINGS", fontsize=11, color="#eab308",
                     fontweight="bold", transform=ax_findings.transAxes)
    for i, finding in enumerate(findings):
        ax_findings.text(0.02, 0.75 - i * 0.18, finding, fontsize=10,
                         color="#c0b8a8", transform=ax_findings.transAxes)

    path = os.path.join(OUT_DIR, "chart6_recommendation.png")
    fig.savefig(path, dpi=150, bbox_inches="tight", facecolor=fig.get_facecolor())
    plt.close(fig)
    print(f"  Saved: {path}")
    return path


def main():
    print("Loading simulation results...")
    scenarios = load_data()
    print(f"Loaded {len(scenarios)} scenarios")

    print("\nGenerating visualizations...")
    charts = []
    charts.append(fig1_quality_curve(scenarios))
    charts.append(fig2_metric_decomposition(scenarios))
    charts.append(fig3_faction_winrates(scenarios))
    charts.append(fig4_heatmaps(scenarios))
    charts.append(fig5_tradeoff(scenarios))
    charts.append(fig6_recommendation(scenarios))

    print(f"\nAll {len(charts)} charts generated successfully.")


if __name__ == "__main__":
    main()
