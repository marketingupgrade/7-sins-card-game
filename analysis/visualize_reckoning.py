#!/usr/bin/env python3
"""
Visualizations for the Final Reckoning + HP Pool evaluation.
Generates 6 charts comparing all 30 configurations.
"""

import json
import os
import numpy as np
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import matplotlib.patches as mpatches
from matplotlib.gridspec import GridSpec

# ─── Style ───────────────────────────────────────────────────
plt.style.use('dark_background')
plt.rcParams.update({
    'font.family': 'sans-serif',
    'font.sans-serif': ['DejaVu Sans'],
    'font.size': 11,
    'axes.titlesize': 14,
    'axes.titleweight': 'bold',
    'figure.facecolor': '#1a1a2e',
    'axes.facecolor': '#16213e',
    'axes.edgecolor': '#444',
    'grid.color': '#333',
    'grid.alpha': 0.3,
})

COLORS = {
    200: '#ff6b6b',
    333: '#ffd93d',
    666: '#6bcb77',
}
HP_LABELS = {200: '200 HP', 333: '333 HP', 666: '666 HP'}

SIN_COLORS = {
    'wrath': '#ef4444',
    'sloth': '#a855f7',
    'greed': '#f97316',
    'envy': '#22c55e',
    'pride': '#6b7280',
    'lust': '#ec4899',
    'gluttony': '#eab308',
}

OUT_DIR = os.path.dirname(__file__)

def load_data():
    path = os.path.join(OUT_DIR, "reckoning_hp_results.json")
    with open(path) as f:
        return json.load(f)

def get_results(data, hp, reckoning):
    return [r for r in data["results"]
            if r["hp_pool"] == hp and r["final_reckoning"] == reckoning]


# ─── Chart 1: Quality Score Comparison (3 HP × Reckoning vs Standard) ───
def chart1_quality_comparison(data):
    fig, axes = plt.subplots(1, 3, figsize=(18, 6), sharey=True)
    fig.suptitle("QUALITY SCORE: RECKONING vs STANDARD\nAcross HP Pools and Defensive Multipliers",
                 fontsize=16, fontweight='bold', color='white', y=1.02)

    for idx, hp in enumerate([200, 333, 666]):
        ax = axes[idx]
        std = get_results(data, hp, False)
        reck = get_results(data, hp, True)

        mults = [r["defense_mult"] for r in std]
        std_q = [r["quality_score"] for r in std]
        reck_q = [r["quality_score"] for r in reck]

        x = np.arange(len(mults))
        width = 0.35

        bars1 = ax.bar(x - width/2, std_q, width, label='Standard', color='#555', alpha=0.7, edgecolor='#888')
        bars2 = ax.bar(x + width/2, reck_q, width, label='Reckoning', color=COLORS[hp], alpha=0.9, edgecolor='white', linewidth=0.5)

        # Add value labels
        for bar in bars1:
            ax.text(bar.get_x() + bar.get_width()/2, bar.get_height() + 0.5,
                    f'{bar.get_height():.1f}', ha='center', va='bottom', fontsize=8, color='#aaa')
        for bar in bars2:
            ax.text(bar.get_x() + bar.get_width()/2, bar.get_height() + 0.5,
                    f'{bar.get_height():.1f}', ha='center', va='bottom', fontsize=9, fontweight='bold', color='white')

        # Delta labels
        for i in range(len(mults)):
            delta = reck_q[i] - std_q[i]
            mid_y = (std_q[i] + reck_q[i]) / 2
            ax.annotate(f'+{delta:.1f}', xy=(x[i], mid_y),
                       fontsize=7, color=COLORS[hp], ha='center', style='italic')

        ax.set_xlabel('Defensive Multiplier', fontsize=10)
        ax.set_xticks(x)
        ax.set_xticklabels([f'×{m:.2f}' for m in mults])
        ax.set_title(f'{HP_LABELS[hp]}', fontsize=13, color=COLORS[hp])
        ax.set_ylim(25, 75)
        ax.grid(axis='y', alpha=0.2)
        ax.legend(fontsize=9, loc='upper left')

    axes[0].set_ylabel('Composite Quality Score', fontsize=11)
    fig.tight_layout()
    path = os.path.join(OUT_DIR, "reck_chart1_quality.png")
    fig.savefig(path, dpi=150, bbox_inches='tight', facecolor=fig.get_facecolor())
    plt.close()
    print(f"  Saved: {path}")


# ─── Chart 2: Timeout Elimination (the killer feature of Reckoning) ───
def chart2_timeout_elimination(data):
    fig, ax = plt.subplots(figsize=(14, 7))

    for hp in [200, 333, 666]:
        std = get_results(data, hp, False)
        reck = get_results(data, hp, True)
        mults = [r["defense_mult"] for r in std]

        std_to = [r["timeout_rate"] * 100 for r in std]
        reck_to = [r["timeout_rate"] * 100 for r in reck]

        ax.plot(mults, std_to, '--', color=COLORS[hp], alpha=0.5, linewidth=1.5,
                label=f'{HP_LABELS[hp]} Standard')
        ax.plot(mults, reck_to, '-o', color=COLORS[hp], linewidth=2.5, markersize=8,
                label=f'{HP_LABELS[hp]} Reckoning')

        # Annotate the standard values
        for i, (m, v) in enumerate(zip(mults, std_to)):
            if i == len(mults) - 1:
                ax.annotate(f'{v:.0f}%', (m, v), textcoords="offset points",
                           xytext=(10, 0), fontsize=9, color=COLORS[hp], alpha=0.6)

        # Annotate reckoning values
        for i, (m, v) in enumerate(zip(mults, reck_to)):
            if i == len(mults) - 1:
                ax.annotate(f'{v:.1f}%', (m, v), textcoords="offset points",
                           xytext=(10, 0), fontsize=9, color=COLORS[hp], fontweight='bold')

    # Highlight the problem zone
    ax.axhspan(30, 100, alpha=0.08, color='red')
    ax.text(1.02, 60, 'UNPLAYABLE\nZONE', fontsize=12, color='#ff4444', alpha=0.4,
            fontweight='bold', ha='left')

    ax.axhspan(0, 5, alpha=0.08, color='green')
    ax.text(1.02, 2.5, 'HEALTHY', fontsize=10, color='#44ff44', alpha=0.4,
            fontweight='bold', ha='left')

    ax.set_xlabel('Defensive Multiplier', fontsize=12)
    ax.set_ylabel('Timeout Rate (%)', fontsize=12)
    ax.set_title("TIMEOUT ELIMINATION: RECKONING'S KILLER FEATURE\nDashed = Standard, Solid = Reckoning",
                 fontsize=14, fontweight='bold', color='white')
    ax.set_ylim(-2, 95)
    ax.legend(fontsize=9, loc='center left', ncol=1)
    ax.grid(alpha=0.2)

    fig.tight_layout()
    path = os.path.join(OUT_DIR, "reck_chart2_timeout.png")
    fig.savefig(path, dpi=150, bbox_inches='tight', facecolor=fig.get_facecolor())
    plt.close()
    print(f"  Saved: {path}")


# ─── Chart 3: Reckoning Mechanics Deep Dive ───
def chart3_reckoning_mechanics(data):
    fig, axes = plt.subplots(2, 2, figsize=(16, 12))
    fig.suptitle("FINAL RECKONING — MECHANICS DEEP DIVE\nHow the Hand Dump Changes the Game",
                 fontsize=16, fontweight='bold', color='white', y=1.01)

    # Panel 1: Trigger Rate
    ax = axes[0, 0]
    for hp in [200, 333, 666]:
        reck = get_results(data, hp, True)
        mults = [r["defense_mult"] for r in reck]
        rates = [r["reckoning_trigger_rate"] * 100 for r in reck]
        ax.plot(mults, rates, '-o', color=COLORS[hp], linewidth=2, markersize=7,
                label=HP_LABELS[hp])
        for m, v in zip(mults, rates):
            ax.annotate(f'{v:.0f}%', (m, v), textcoords="offset points",
                       xytext=(0, 8), fontsize=8, ha='center', color=COLORS[hp])
    ax.set_title('Reckoning Trigger Rate', fontsize=12, color='#ddd')
    ax.set_ylabel('% of Games Reaching Round 20')
    ax.set_xlabel('Defensive Multiplier')
    ax.legend(fontsize=9)
    ax.grid(alpha=0.2)
    ax.set_ylim(0, 100)

    # Panel 2: Decisive Rate (outcome flips)
    ax = axes[0, 1]
    for hp in [200, 333, 666]:
        reck = get_results(data, hp, True)
        mults = [r["defense_mult"] for r in reck]
        rates = [r["reckoning_decisive_rate"] * 100 for r in reck]
        ax.plot(mults, rates, '-s', color=COLORS[hp], linewidth=2, markersize=7,
                label=HP_LABELS[hp])
        for m, v in zip(mults, rates):
            ax.annotate(f'{v:.0f}%', (m, v), textcoords="offset points",
                       xytext=(0, 8), fontsize=8, ha='center', color=COLORS[hp])
    ax.set_title('Reckoning Decisiveness (Outcome Flips)', fontsize=12, color='#ddd')
    ax.set_ylabel('% of Reckonings That Flip Winner')
    ax.set_xlabel('Defensive Multiplier')
    ax.legend(fontsize=9)
    ax.grid(alpha=0.2)
    ax.set_ylim(0, 50)

    # Panel 3: Average HP Swing
    ax = axes[1, 0]
    for hp in [200, 333, 666]:
        reck = get_results(data, hp, True)
        mults = [r["defense_mult"] for r in reck]
        swings = [r["avg_reckoning_hp_swing"] for r in reck]
        pct_swings = [s / hp * 100 for s in swings]
        ax.bar([m + (hp - 333) * 0.08 for m in mults], pct_swings,
               width=0.07, color=COLORS[hp], alpha=0.8, label=HP_LABELS[hp])
    ax.set_title('Reckoning HP Swing (% of Pool)', fontsize=12, color='#ddd')
    ax.set_ylabel('Average HP Swing as % of Max HP')
    ax.set_xlabel('Defensive Multiplier')
    ax.legend(fontsize=9)
    ax.grid(alpha=0.2, axis='y')

    # Panel 4: Cards Played in Reckoning
    ax = axes[1, 1]
    for hp in [200, 333, 666]:
        reck = get_results(data, hp, True)
        mults = [r["defense_mult"] for r in reck]
        cards = [r["avg_reckoning_cards"] for r in reck]
        ax.plot(mults, cards, '-D', color=COLORS[hp], linewidth=2, markersize=7,
                label=HP_LABELS[hp])
        for m, v in zip(mults, cards):
            ax.annotate(f'{v:.1f}', (m, v), textcoords="offset points",
                       xytext=(0, 8), fontsize=8, ha='center', color=COLORS[hp])
    ax.set_title('Cards Dumped in Reckoning (Both Players)', fontsize=12, color='#ddd')
    ax.set_ylabel('Average Cards Played')
    ax.set_xlabel('Defensive Multiplier')
    ax.legend(fontsize=9)
    ax.grid(alpha=0.2)
    ax.set_ylim(15, 30)

    fig.tight_layout()
    path = os.path.join(OUT_DIR, "reck_chart3_mechanics.png")
    fig.savefig(path, dpi=150, bbox_inches='tight', facecolor=fig.get_facecolor())
    plt.close()
    print(f"  Saved: {path}")


# ─── Chart 4: HP Pool Comparison (Game Feel) ───
def chart4_game_feel(data):
    fig, axes = plt.subplots(2, 2, figsize=(16, 12))
    fig.suptitle("HP POOL IMPACT ON GAME FEEL (WITH RECKONING)\nHow Starting HP Changes the Experience",
                 fontsize=16, fontweight='bold', color='white', y=1.01)

    # Panel 1: Game Length
    ax = axes[0, 0]
    for hp in [200, 333, 666]:
        reck = get_results(data, hp, True)
        mults = [r["defense_mult"] for r in reck]
        gl = [r["avg_game_length"] for r in reck]
        ax.plot(mults, gl, '-o', color=COLORS[hp], linewidth=2, markersize=7, label=HP_LABELS[hp])
    ax.axhspan(14, 18, alpha=0.1, color='green')
    ax.text(1.9, 16, 'IDEAL\nRANGE', fontsize=9, color='#44ff44', alpha=0.5, ha='center')
    ax.set_title('Average Game Length (Rounds)', color='#ddd')
    ax.set_ylabel('Rounds')
    ax.set_xlabel('Defensive Multiplier')
    ax.legend(fontsize=9)
    ax.grid(alpha=0.2)

    # Panel 2: Blowout Rate
    ax = axes[0, 1]
    for hp in [200, 333, 666]:
        reck = get_results(data, hp, True)
        mults = [r["defense_mult"] for r in reck]
        bl = [r["blowout_rate"] * 100 for r in reck]
        ax.plot(mults, bl, '-o', color=COLORS[hp], linewidth=2, markersize=7, label=HP_LABELS[hp])
    ax.set_title('Blowout Rate (Games Ending Before Round 8)', color='#ddd')
    ax.set_ylabel('% of Games')
    ax.set_xlabel('Defensive Multiplier')
    ax.legend(fontsize=9)
    ax.grid(alpha=0.2)

    # Panel 3: Comeback Rate
    ax = axes[1, 0]
    for hp in [200, 333, 666]:
        reck = get_results(data, hp, True)
        mults = [r["defense_mult"] for r in reck]
        cr = [r["comeback_rate"] * 100 for r in reck]
        ax.plot(mults, cr, '-o', color=COLORS[hp], linewidth=2, markersize=7, label=HP_LABELS[hp])
    ax.set_title('Comeback Rate (Winner Was Trailing at Midpoint)', color='#ddd')
    ax.set_ylabel('% of Games')
    ax.set_xlabel('Defensive Multiplier')
    ax.legend(fontsize=9)
    ax.grid(alpha=0.2)

    # Panel 4: Final HP Difference
    ax = axes[1, 1]
    for hp in [200, 333, 666]:
        reck = get_results(data, hp, True)
        mults = [r["defense_mult"] for r in reck]
        diff_pct = [r["avg_final_hp_diff"] / hp * 100 for r in reck]
        ax.plot(mults, diff_pct, '-o', color=COLORS[hp], linewidth=2, markersize=7, label=HP_LABELS[hp])
    ax.set_title('Average Final HP Difference (% of Pool)', color='#ddd')
    ax.set_ylabel('% of Max HP')
    ax.set_xlabel('Defensive Multiplier')
    ax.legend(fontsize=9)
    ax.grid(alpha=0.2)

    fig.tight_layout()
    path = os.path.join(OUT_DIR, "reck_chart4_gamefeel.png")
    fig.savefig(path, dpi=150, bbox_inches='tight', facecolor=fig.get_facecolor())
    plt.close()
    print(f"  Saved: {path}")


# ─── Chart 5: Faction Win Rates at Best Configs ───
def chart5_faction_balance(data):
    fig, axes = plt.subplots(1, 3, figsize=(18, 7), sharey=True)
    fig.suptitle("FACTION WIN RATES — BEST CONFIGURATION PER HP POOL (WITH RECKONING)\nCloser to 50% = Better Balance",
                 fontsize=14, fontweight='bold', color='white', y=1.02)

    sins = ['wrath', 'sloth', 'greed', 'envy', 'pride', 'lust', 'gluttony']

    for idx, hp in enumerate([200, 333, 666]):
        ax = axes[idx]
        # Get best reckoning config for this HP
        reck_results = get_results(data, hp, True)
        best = max(reck_results, key=lambda r: r["quality_score"])

        wr = [best["win_rates"][s] * 100 for s in sins]
        colors = [SIN_COLORS[s] for s in sins]

        bars = ax.barh(range(len(sins)), wr, color=colors, alpha=0.85, edgecolor='white', linewidth=0.5)

        # 50% line
        ax.axvline(50, color='white', linestyle='--', alpha=0.5, linewidth=1)
        ax.axvspan(48.5, 51.5, alpha=0.08, color='green')

        for i, (bar, v) in enumerate(zip(bars, wr)):
            ax.text(v + 1, i, f'{v:.1f}%', va='center', fontsize=9,
                    color=colors[i], fontweight='bold')

        ax.set_yticks(range(len(sins)))
        ax.set_yticklabels([s.capitalize() for s in sins], fontsize=10)
        ax.set_xlabel('Win Rate (%)')
        ax.set_xlim(0, 100)
        ax.set_title(f'{HP_LABELS[hp]} | Def=×{best["defense_mult"]:.2f}\nQ={best["quality_score"]:.1f}',
                     fontsize=11, color=COLORS[hp])
        ax.grid(axis='x', alpha=0.2)

    fig.tight_layout()
    path = os.path.join(OUT_DIR, "reck_chart5_factions.png")
    fig.savefig(path, dpi=150, bbox_inches='tight', facecolor=fig.get_facecolor())
    plt.close()
    print(f"  Saved: {path}")


# ─── Chart 6: Final Recommendation Dashboard ───
def chart6_recommendation(data):
    fig = plt.figure(figsize=(18, 10))
    fig.patch.set_facecolor('#1a1a2e')

    # Title
    fig.text(0.5, 0.96, "FINAL RECKONING + HP POOL — RECOMMENDATION",
             fontsize=20, fontweight='bold', color='white', ha='center')
    fig.text(0.5, 0.925, f"Based on 1,260,000 Monte Carlo simulated games across 30 configurations",
             fontsize=11, color='#888', ha='center')

    # Get the recommended config: 333 HP + ×1.75 + Reckoning
    reck_333 = [r for r in data["results"]
                if r["hp_pool"] == 333 and r["final_reckoning"] and r["defense_mult"] == 1.75][0]
    baseline = [r for r in data["results"]
                if r["hp_pool"] == 200 and not r["final_reckoning"] and r["defense_mult"] == 1.0][0]

    # Left panel: Recommendation
    ax_left = fig.add_axes([0.03, 0.15, 0.25, 0.7])
    ax_left.set_xlim(0, 10)
    ax_left.set_ylim(0, 10)
    ax_left.axis('off')

    ax_left.text(5, 9.2, 'RECOMMENDED', fontsize=14, color='#22c55e', ha='center', fontweight='bold')
    ax_left.text(5, 7.8, '333 HP', fontsize=36, color='#ffd93d', ha='center', fontweight='bold')
    ax_left.text(5, 6.8, '+ ×1.75 Defense', fontsize=16, color='#ffd93d', ha='center')
    ax_left.text(5, 5.8, '+ Final Reckoning', fontsize=16, color='#22c55e', ha='center', fontweight='bold')

    ax_left.text(5, 4.5, f'Quality Score: {reck_333["quality_score"]:.1f}', fontsize=13, color='white', ha='center')
    ax_left.text(5, 3.7, f'(+{reck_333["quality_score"] - baseline["quality_score"]:.1f} vs current baseline)',
                fontsize=10, color='#888', ha='center')

    ax_left.text(5, 2.5, 'sweet spot between\ndrama and strategy', fontsize=10,
                color='#666', ha='center', style='italic')

    # Right panel: Comparison table
    ax_right = fig.add_axes([0.32, 0.15, 0.65, 0.7])
    ax_right.axis('off')

    # Table data
    headers = ['Metric', 'Current\n(200 HP, ×1.0, Std)', 'Recommended\n(333 HP, ×1.75, Reck)', 'Trend']

    # Get 666 HP best for comparison
    reck_666 = [r for r in data["results"]
                if r["hp_pool"] == 666 and r["final_reckoning"] and r["defense_mult"] == 2.0][0]

    rows = [
        ['Quality Score', f'{baseline["quality_score"]:.1f}', f'{reck_333["quality_score"]:.1f}',
         f'+{reck_333["quality_score"] - baseline["quality_score"]:.1f}'],
        ['Game Length', f'{baseline["avg_game_length"]:.1f}r', f'{reck_333["avg_game_length"]:.1f}r', '↑'],
        ['Timeout Rate', f'{baseline["timeout_rate"]:.1%}', f'{reck_333["timeout_rate"]:.1%}', '↓↓↓'],
        ['Blowout Rate', f'{baseline["blowout_rate"]:.1%}', f'{reck_333["blowout_rate"]:.1%}', '↓↓'],
        ['Faction Deviation', f'{baseline["faction_balance_deviation"]:.3f}', f'{reck_333["faction_balance_deviation"]:.3f}', '↓'],
        ['Comeback Rate', f'{baseline["comeback_rate"]:.1%}', f'{reck_333["comeback_rate"]:.1%}', '↑'],
        ['Reckoning Trigger', 'N/A', f'{reck_333["reckoning_trigger_rate"]:.0%}', 'NEW'],
        ['Reckoning Decisive', 'N/A', f'{reck_333["reckoning_decisive_rate"]:.0%}', 'NEW'],
    ]

    # Draw table
    y_start = 0.95
    row_height = 0.1
    col_widths = [0.28, 0.28, 0.28, 0.16]
    col_starts = [0.0]
    for w in col_widths[:-1]:
        col_starts.append(col_starts[-1] + w)

    # Headers
    for j, (header, x) in enumerate(zip(headers, col_starts)):
        color = '#888' if j == 0 else ('#ff6b6b' if j == 1 else ('#22c55e' if j == 2 else '#888'))
        ax_right.text(x + col_widths[j]/2, y_start, header,
                     fontsize=10, fontweight='bold', color=color, ha='center', va='top',
                     transform=ax_right.transAxes)

    # Rows
    for i, row in enumerate(rows):
        y = y_start - (i + 1.5) * row_height
        for j, (val, x) in enumerate(zip(row, col_starts)):
            if j == 0:
                color = '#ccc'
                weight = 'normal'
            elif j == 1:
                color = '#ff6b6b'
                weight = 'normal'
            elif j == 2:
                color = '#ffd93d'
                weight = 'bold'
            else:
                color = '#22c55e' if '↓' in val or '+' in val or val == 'NEW' else '#ff6b6b'
                weight = 'bold'
            ax_right.text(x + col_widths[j]/2, y, val,
                         fontsize=11, color=color, ha='center', va='center',
                         fontweight=weight, transform=ax_right.transAxes)

    # Key findings at bottom
    findings_y = 0.02
    findings = [
        "1. Final Reckoning eliminates the timeout problem entirely (30% → 1.4%)",
        "2. 333 HP hits the sweet spot: long enough for strategy, short enough for excitement",
        "3. 60% of games trigger Reckoning — a healthy mix of kills and dramatic finales",
        "4. 25% of Reckonings flip the winner — genuine comeback potential in the final round",
        "5. 666 HP scores higher (68.8) but 89% of games become Reckoning-dependent — less variety",
    ]
    for i, f in enumerate(findings):
        fig.text(0.05, findings_y + (len(findings) - 1 - i) * 0.025, f,
                fontsize=9, color='#aaa')

    path = os.path.join(OUT_DIR, "reck_chart6_recommendation.png")
    fig.savefig(path, dpi=150, bbox_inches='tight', facecolor=fig.get_facecolor())
    plt.close()
    print(f"  Saved: {path}")


# ─── Main ────────────────────────────────────────────────────
def main():
    print("Loading simulation results...")
    data = load_data()
    print(f"Loaded {len(data['results'])} configurations")
    print("\nGenerating visualizations...")

    chart1_quality_comparison(data)
    chart2_timeout_elimination(data)
    chart3_reckoning_mechanics(data)
    chart4_game_feel(data)
    chart5_faction_balance(data)
    chart6_recommendation(data)

    print("\nAll 6 charts generated successfully.")


if __name__ == "__main__":
    main()
