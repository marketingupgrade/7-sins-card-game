import type { SinType } from "@shared/gameTypes";
import React from 'react';

interface Stats {
  damageDealt: number;
  healingDone: number;
  cardsPlayed: number;
  roundsSurvived: number;
}

interface ShareableBattleCardProps {
  playerName: string;
  sin: SinType;
  isWinner: boolean;
  stats: Stats;
  onGenerate: (dataUrl: string) => void;
}

const ShareableBattleCard: React.FC<ShareableBattleCardProps> = ({
  playerName,
  sin,
  isWinner,
  stats,
  onGenerate
}) => {
  const sinColors: Record<SinType, string> = {
    wrath: '#FF3333',
    sloth: '#6B46C1',
    greed: '#F59E0B',
    envy: '#10B981',
    pride: '#F0F0F0',
    lust: '#EC4899',
    gluttony: '#B45309',
  };

  const generateCard = async () => {
    const canvas = document.createElement('canvas');
    canvas.width = 1200;
    canvas.height = 630;
    const ctx = canvas.getContext('2d')!;

    // Dark background
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(0, 0, 1200, 630);

    // Sin-colored border
    ctx.strokeStyle = sinColors[sin];
    ctx.lineWidth = 8;
    ctx.strokeRect(20, 20, 1160, 590);

    // Inner glow effect
    const gradient = ctx.createRadialGradient(600, 315, 0, 600, 315, 400);
    gradient.addColorStop(0, `${sinColors[sin]}20`);
    gradient.addColorStop(1, 'transparent');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 1200, 630);

    // Title
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 72px Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('7 DEADLY SINS', 600, 120);

    // Player name
    ctx.font = 'bold 48px Arial, sans-serif';
    ctx.fillStyle = sinColors[sin];
    ctx.fillText(playerName, 600, 200);

    // Sin faction
    ctx.font = '36px Arial, sans-serif';
    ctx.fillStyle = '#cccccc';
    ctx.fillText(`Sin of ${sin.charAt(0).toUpperCase() + sin.slice(1)}`, 600, 250);

    // Win/Loss badge
    const badgeWidth = 200;
    const badgeHeight = 60;
    const badgeX = 600 - badgeWidth / 2;
    const badgeY = 280;

    ctx.fillStyle = isWinner ? '#22C55E' : '#EF4444';
    ctx.fillRect(badgeX, badgeY, badgeWidth, badgeHeight);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 32px Arial, sans-serif';
    ctx.fillText(isWinner ? 'VICTORY' : 'DEFEAT', 600, 320);

    // Stats grid background
    const statsY = 380;
    const statBoxWidth = 250;
    const statBoxHeight = 120;
    const spacing = 40;
    const totalWidth = (statBoxWidth * 4) + (spacing * 3);
    const startX = (1200 - totalWidth) / 2;

    const statLabels = [
      'Damage Dealt',
      'Healing Done',
      'Cards Played',
      'Rounds Survived'
    ];
    
    const statValues = [
      stats.damageDealt,
      stats.healingDone,
      stats.cardsPlayed,
      stats.roundsSurvived
    ];

    for (let i = 0; i < 4; i++) {
      const x = startX + (i * (statBoxWidth + spacing));
      
      // Stat box background
      ctx.fillStyle = '#333333';
      ctx.fillRect(x, statsY, statBoxWidth, statBoxHeight);
      
      // Stat box border
      ctx.strokeStyle = sinColors[sin];
      ctx.lineWidth = 2;
      ctx.strokeRect(x, statsY, statBoxWidth, statBoxHeight);
      
      // Stat value
      ctx.fillStyle = sinColors[sin];
      ctx.font = 'bold 36px Arial, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(statValues[i].toString(), x + statBoxWidth / 2, statsY + 50);
      
      // Stat label
      ctx.fillStyle = '#cccccc';
      ctx.font = '18px Arial, sans-serif';
      ctx.fillText(statLabels[i], x + statBoxWidth / 2, statsY + 80);
    }

    // Decorative corner elements
    ctx.strokeStyle = sinColors[sin];
    ctx.lineWidth = 4;
    
    // Top left corner
    ctx.beginPath();
    ctx.moveTo(60, 100);
    ctx.lineTo(60, 60);
    ctx.lineTo(100, 60);
    ctx.stroke();
    
    // Top right corner
    ctx.beginPath();
    ctx.moveTo(1140, 60);
    ctx.lineTo(1140, 100);
    ctx.moveTo(1100, 60);
    ctx.lineTo(1140, 60);
    ctx.stroke();
    
    // Bottom left corner
    ctx.beginPath();
    ctx.moveTo(60, 530);
    ctx.lineTo(60, 570);
    ctx.lineTo(100, 570);
    ctx.stroke();
    
    // Bottom right corner
    ctx.beginPath();
    ctx.moveTo(1140, 570);
    ctx.lineTo(1140, 530);
    ctx.moveTo(1100, 570);
    ctx.lineTo(1140, 570);
    ctx.stroke();

    const dataUrl = canvas.toDataURL('image/png');
    onGenerate(dataUrl);
    return dataUrl;
  };

  const handleShare = async () => {
    const dataUrl = await generateCard();
    
    if (navigator.share) {
      try {
        const response = await fetch(dataUrl);
        const blob = await response.blob();
        const file = new File([blob], 'battle-card.png', { type: 'image/png' });
        
        await navigator.share({
          title: '7 Deadly Sins Battle Result',
          text: `${playerName} - ${isWinner ? 'Victory' : 'Defeat'} as ${sin}!`,
          files: [file]
        });
      } catch (error) {
        console.error('Error sharing:', error);
        downloadImage(dataUrl);
      }
    } else {
      downloadImage(dataUrl);
    }
  };

  const downloadImage = (dataUrl: string) => {
    const link = document.createElement('a');
    link.download = 'battle-card.png';
    link.href = dataUrl;
    link.click();
  };

  return (
    <div className="flex flex-col items-center space-y-4">
      <button
        onClick={handleShare}
        className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
      >
        Share Battle Card
      </button>
    </div>
  );
};

export default ShareableBattleCard;
