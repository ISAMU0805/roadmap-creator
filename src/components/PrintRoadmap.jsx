// src/components/PrintRoadmap.jsx

import React, { useMemo } from 'react';
import { useParams } from 'react-router-dom';
// デフォルトデータを別名でインポート
import defaultRoadmapData from '../data/roadmapData.json';
import '../styles/PrintRoadmap.css';

const PrintRoadmap = () => {
  const { gameId } = useParams();
  
  // 修正: ローカルストレージに編集データがあればそれを優先して使う
  const game = useMemo(() => {
    const savedData = localStorage.getItem('roadmapData');
    const data = savedData ? JSON.parse(savedData) : defaultRoadmapData;
    return data.find(g => g.gameId === gameId);
  }, [gameId]);

  if (!game) {
    return <div className="print-error">ゲームが見つかりません: {gameId}</div>;
  }

  // --- レイアウト設定 ---
  const COLUMN_COUNT = 4;
  const X_SPACING = 240;
  const Y_SPACING = 200;
  const PADDING_X = 100;
  const PADDING_Y = 100;
  const CARD_OFFSET_X = 80;
  const CARD_OFFSET_Y = 80;

  const getStepPosition = (index) => {
    const row = Math.floor(index / COLUMN_COUNT);
    let col = index % COLUMN_COUNT;
    if (row % 2 !== 0) {
      col = (COLUMN_COUNT - 1) - col;
    }
    return {
      x: PADDING_X + (col * X_SPACING),
      y: PADDING_Y + (row * Y_SPACING)
    };
  };

  const totalRows = Math.ceil(game.steps.length / COLUMN_COUNT);
  const containerHeight = PADDING_Y * 2 + (totalRows * Y_SPACING);

  const linesPath = useMemo(() => {
    if (game.steps.length < 2) return '';
    let path = '';
    
    for (let i = 0; i < game.steps.length - 1; i++) {
      const current = getStepPosition(i);
      const next = getStepPosition(i + 1);
      
      path += `M${current.x + CARD_OFFSET_X} ${current.y + CARD_OFFSET_Y} L${next.x + CARD_OFFSET_X} ${next.y + CARD_OFFSET_Y} `;
    }
    return path;
  }, [game]);

  return (
    <div className="print-container">
      <div className="print-controls no-print">
        <button onClick={() => window.print()}>🖨️ このページを印刷する</button>
        <button onClick={() => window.close()}>とじる</button>
      </div>

      <div className="print-sheet">
        <h1 className="print-title">🏁 {game.gameName} スタンプラリー 🏁</h1>
        <p className="print-desc">{game.description}</p>

        <div className="print-grid" style={{ height: `${containerHeight}px` }}>
          <svg className="print-lines">
            <path d={linesPath} stroke="#333" strokeWidth="4" fill="none" strokeDasharray="15 10" strokeLinecap="round" />
          </svg>

          {game.steps.map((step, index) => {
            const pos = getStepPosition(index);
            return (
              <div 
                key={step.id} 
                className="print-card"
                style={{ top: pos.y, left: pos.x }}
              >
                <div className="stamp-area">
                  <span className="stamp-placeholder">Step {step.id}</span>
                </div>
                <div className="card-info">
                  <h3>{step.title}</h3>
                  {step.image && <img src={step.image} alt="" className="mini-icon" />}
                </div>
              </div>
            );
          })}
        </div>
        
        <div className="print-footer">
          名前: ____________________ &nbsp;&nbsp; 開始日: ____/____/____
        </div>
      </div>
    </div>
  );
};

export default PrintRoadmap;