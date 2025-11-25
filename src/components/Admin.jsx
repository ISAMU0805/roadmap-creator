// src/App.jsx

import roadmapData from './data/roadmapData.json';
import { useState, useMemo, useEffect } from 'react'; 
import StepDetail from './components/StepDetail'; 
import { Link } from 'react-router-dom';
import './styles/Roadmap.css'; 

function App() {
  const [selectedGameId, setSelectedGameId] = useState(roadmapData[0].gameId); 
  const selectedGame = roadmapData.find(game => game.gameId === selectedGameId);

  const initialStepId = selectedGame ? selectedGame.steps[0].id : 1; 
  const [selectedStepId, setSelectedStepId] = useState(initialStepId); 
  
  const [isAdminLinkVisible, setIsAdminLinkVisible] = useState(false); 

  // --- シークレットコマンドの処理 ---
  useEffect(() => {
    const handleKeyDown = (event) => {
      // Ctrl + Alt + A で管理者リンクを表示
      if (event.ctrlKey && event.altKey && event.key === 'a') {
        event.preventDefault(); 
        setIsAdminLinkVisible(true);
        console.log("管理者リンクが表示されました。"); 
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const handleGameSelect = (gameId) => {
    setSelectedGameId(gameId);
    const newGame = roadmapData.find(game => game.gameId === gameId);
    if (newGame) {
      setSelectedStepId(newGame.steps[0].id);
    }
  };

  // ==========================================
  // 📐 自動レイアウト設定 (スマホ対応を強化)
  // ==========================================
  // 👇 修正点: PCとスマホで COLUMNS_PER_ROW を動的に切り替える
  const getColumnsPerRow = () => {
    // 画面幅が768px以下の場合は2列、それ以上の場合は3列をデフォルトにする
    // カードのサイズと余白を考慮して、動的に調整することも可能だが、ここではシンプルに
    if (window.innerWidth <= 768) {
      return 2; // スマホ/タブレットでは2列表示
    }
    return 3; // PCでは3列表示
  };

  const COLUMNS_PER_ROW = useMemo(() => getColumnsPerRow(), [window.innerWidth]); // 画面幅に応じて列数を更新
  
  const X_SPACING = COLUMNS_PER_ROW === 2 ? 160 : 220; // 2列の時は間隔を狭く
  const Y_SPACING = COLUMNS_PER_ROW === 2 ? 120 : 180; // 2列の時は間隔を狭く
  const PADDING_X = 20;       // 左右のパディングを小さく
  const PADDING_Y = 20;       // 上下のパディングを小さく

  // カードの中心ズレ補正（線の描画用）
  const CARD_CENTER_OFFSET_X = 70; 
  const CARD_CENTER_OFFSET_Y = 60; 

  /**
   * 📍 座標計算関数 (ジグザグ配置)
   */
  const getStepPosition = (index) => {
    const row = Math.floor(index / COLUMNS_PER_ROW);
    let col = index % COLUMNS_PER_ROW;
    const isOddRow = row % 2 !== 0;
    if (isOddRow) {
      col = (COLUMNS_PER_ROW - 1) - col;
    }
    return {
      x: PADDING_X + (col * X_SPACING),
      y: PADDING_Y + (row * Y_SPACING)
    };
  };

  const totalRows = Math.ceil(selectedGame.steps.length / COLUMNS_PER_ROW);
  // 盤面の高さを動的に計算
  const requiredHeight = Math.max(600, PADDING_Y + (totalRows * Y_SPACING) + 50);


  // --- SVGの線を計算 (直線) ---
  const linesPath = useMemo(() => {
    if (!selectedGame || selectedGame.steps.length < 2) return '';

    let path = '';
    const steps = selectedGame.steps;
    
    for (let i = 0; i < steps.length - 1; i++) {
      const currentPos = getStepPosition(i);
      const nextPos = getStepPosition(i + 1);

      const startX = currentPos.x + CARD_CENTER_OFFSET_X;
      const startY = currentPos.y + CARD_CENTER_OFFSET_Y;
      const endX = nextPos.x + CARD_CENTER_OFFSET_X;
      const endY = nextPos.y + CARD_CENTER_OFFSET_Y;

      path += `M${startX} ${startY} L${endX} ${endY} `;
    }

    return path;
  }, [selectedGame]);


  // --- レンダリング ---
  return (
    <>
      <div className="app-nav">
        <Link to="/" style={{backgroundColor: '#ff9800'}}>生徒用ロードマップ</Link>
        <span>|</span>
        {isAdminLinkVisible && (
          <Link to="/admin" className="admin-link-visible">管理・編集ツールへ</Link>
        )}
        {!isAdminLinkVisible && (
          <span style={{width: '150px'}}></span> 
        )}
      </div>

      <div className="roadmap-container">
        
        {/* ゲーム切り替えボタン */}
        <div className="game-selector"> 
          {roadmapData.map(game => (
            <button
              key={game.gameId}
              onClick={() => handleGameSelect(game.gameId)}
              className={game.gameId === selectedGameId ? 'active' : ''}
            >
              {game.gameName}
            </button>
          ))}
        </div>
        
        <h1>{selectedGame.gameName} ロードマップ</h1>
        
        <div className="main-layout">
          
          {/* 左側：ロードマップ（スクロール可能エリア） */}
          <div className="roadmap-grid-container">
            <div 
              className="roadmap-steps" 
              style={{ height: `${requiredHeight}px` }} 
            >
              {selectedGame.steps.map((step, index) => {
                const pos = getStepPosition(index);

                return (
                  <div 
                    key={step.id} 
                    onClick={() => setSelectedStepId(step.id)} 
                    className={`step-card ${step.id === selectedStepId ? 'active' : ''}`}
                    style={{
                      top: `${pos.y}px`,
                      left: `${pos.x}px`,
                    }}
                  >
                    {step.image && (
                      <img 
                        src={step.image} 
                        alt={step.title} 
                        className="step-image" 
                      />
                    )}
                    <h3 className="step-id">Step {step.id}</h3>
                    <p className="step-title">{step.title}</p>
                  </div>
                );
              })}
              
              {/* 線の描画 */}
              <svg className="roadmap-lines">
                 <path 
                    d={linesPath} 
                    stroke="#ff9800" 
                    strokeWidth="6" 
                    fill="none" 
                    strokeDasharray="10 5"
                 />
              </svg>
            </div>
          </div>
          
          {/* 右側：詳細パネル */}
          <div className="detail-panel">
            <h2>ステップ詳細</h2>
            <StepDetail steps={selectedGame.steps} selectedId={selectedStepId} />
          </div>

        </div>
      </div>
    </>
  )
}

export default App