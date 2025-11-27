// src/components/Admin.jsx

import React, { useState, useRef, useEffect } from 'react';
import roadmapData from '../data/roadmapData.json';
import { Link } from 'react-router-dom';
import '../styles/Admin.css';

const Admin = () => {
  // 修正: 初期値をローカルストレージから取得（なければJSONファイルから）
  const [games, setGames] = useState(() => {
    const savedData = localStorage.getItem('roadmapData');
    return savedData ? JSON.parse(savedData) : roadmapData;
  });

  // ドラッグ操作用の参照
  const dragItem = useRef(null);
  const dragOverItem = useRef(null);

  // 自動スクロール用の参照
  const scrollSpeed = useRef(0);
  const animationFrameId = useRef(null);

  // 修正: gamesの状態が変わるたびにローカルストレージに保存
  useEffect(() => {
    localStorage.setItem('roadmapData', JSON.stringify(games));
  }, [games]);

  // --- データ操作関数 ---

  const updateGame = (gameIndex, field, value) => {
    const newGames = [...games];
    newGames[gameIndex][field] = value;
    setGames(newGames);
  };

  const addGame = () => {
    const newGame = {
      gameId: `new_game_${Date.now()}`,
      gameName: "新しいゲーム",
      description: "ここにゲームの説明が入ります",
      steps: []
    };
    setGames([...games, newGame]);
  };

  const deleteGame = (gameIndex) => {
    if (window.confirm("本当にこのゲームを削除しますか？")) {
      const newGames = games.filter((_, i) => i !== gameIndex);
      setGames(newGames);
    }
  };

  const addStep = (gameIndex) => {
    const newGames = [...games];
    const newStepId = newGames[gameIndex].steps.length + 1;
    newGames[gameIndex].steps.push({
      id: newStepId,
      title: "新しいステップ",
      content: "説明を入力してください",
      type: "setup",
      image: ""
    });
    setGames(newGames);
  };

  const updateStep = (gameIndex, stepIndex, field, value) => {
    const newGames = [...games];
    newGames[gameIndex].steps[stepIndex][field] = value;
    setGames(newGames);
  };

  const deleteStep = (gameIndex, stepIndex) => {
    const newGames = [...games];
    newGames[gameIndex].steps = newGames[gameIndex].steps.filter((_, i) => i !== stepIndex);
    // IDを振り直す
    newGames[gameIndex].steps = newGames[gameIndex].steps.map((step, i) => ({...step, id: i + 1}));
    setGames(newGames);
  };

  // --- 自動スクロール機能 ---
  
  const handleWindowDragOver = (e) => {
    const threshold = 100;
    const maxSpeed = 20;
    const { innerHeight } = window;
    const clientY = e.clientY;

    if (clientY < threshold) {
      const intensity = (threshold - clientY) / threshold;
      scrollSpeed.current = -(maxSpeed * intensity);
    } else if (clientY > innerHeight - threshold) {
      const intensity = (clientY - (innerHeight - threshold)) / threshold;
      scrollSpeed.current = maxSpeed * intensity;
    } else {
      scrollSpeed.current = 0;
    }
  };

  const performAutoScroll = () => {
    if (scrollSpeed.current !== 0) {
      window.scrollBy(0, scrollSpeed.current);
    }
    animationFrameId.current = requestAnimationFrame(performAutoScroll);
  };

  // --- ドラッグ＆ドロップ並び替え機能 ---
  
  const handleDragStart = (e, position) => {
    dragItem.current = position;
    e.target.closest('.admin-step-card').classList.add('dragging');
    
    window.addEventListener('dragover', handleWindowDragOver);
    animationFrameId.current = requestAnimationFrame(performAutoScroll);
  };

  const handleDragEnter = (e, position, gameIndex) => {
    dragOverItem.current = position;
    
    if (dragItem.current === null || dragItem.current === dragOverItem.current) return;

    const newGames = [...games];
    const gameSteps = [...newGames[gameIndex].steps];
    
    const draggedStepContent = gameSteps[dragItem.current];
    gameSteps.splice(dragItem.current, 1);
    gameSteps.splice(dragOverItem.current, 0, draggedStepContent);

    // IDを順番通りに振り直す
    const reIndexedSteps = gameSteps.map((step, i) => ({
      ...step,
      id: i + 1
    }));

    newGames[gameIndex].steps = reIndexedSteps;
    setGames(newGames);

    dragItem.current = dragOverItem.current;
  };

  const handleDragEnd = (e) => {
    dragItem.current = null;
    dragOverItem.current = null;
    e.target.closest('.admin-step-card').classList.remove('dragging');
    
    window.removeEventListener('dragover', handleWindowDragOver);
    if (animationFrameId.current) {
      cancelAnimationFrame(animationFrameId.current);
    }
    scrollSpeed.current = 0;
  };

  // --- JSONダウンロード機能 ---
  const handleDownload = () => {
    const jsonString = JSON.stringify(games, null, 2);
    const blob = new Blob([jsonString], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = "roadmapData.json"; 
    link.click();
    URL.revokeObjectURL(url);
    
    alert("✅ roadmapData.json をダウンロードしました。\n\nこのファイルを管理者に送ってください。");
  };

  // 追加機能: 編集リセットボタン（デバッグ用などに便利）
  const handleReset = () => {
    if(window.confirm("編集中のデータを破棄して、元のファイルの状態に戻しますか？")) {
      localStorage.removeItem('roadmapData');
      window.location.reload();
    }
  }

  // --- 画面描画 ---
  return (
    <>
      <div className="app-nav">
        <Link to="/">生徒用ページへ（確認）</Link>
        <span>|</span>
        <Link to="/admin" style={{backgroundColor: '#007bff'}}>管理・編集ツール</Link>
      </div>

      <div className="admin-container">
        <div className="admin-header">
          <h1>🛠️ ロードマップ作成ツール</h1>
          <div style={{display:'flex', gap:'10px', flexWrap:'wrap'}}>
            <button className="save-button" onClick={handleDownload}>
                ⬇️ JSONをダウンロード
            </button>
            <button onClick={handleReset} style={{padding:'10px', cursor:'pointer', border:'1px solid #ccc', background:'#fff', borderRadius:'5px'}}>
                🔄 元に戻す
            </button>
          </div>
          <p className="note">
            ※編集内容はブラウザに一時保存されます。ダウンロードした <code>roadmapData.json</code> を管理者に送ることで正式に保存されます。
          </p>
        </div>

        {games.map((game, gameIndex) => (
          <div key={game.gameId} className="admin-game-card">
            <div className="game-header">
              <input
                type="text"
                value={game.gameName}
                onChange={(e) => updateGame(gameIndex, 'gameName', e.target.value)}
                className="input-title"
                placeholder="ゲーム名"
              />
              <div style={{ display: 'flex', gap: '10px' }}>
                <a 
                  href={`/print/${game.gameId}`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="delete-btn"
                  style={{ backgroundColor: '#6f42c1', textDecoration: 'none', textAlign: 'center', display:'flex', alignItems:'center' }}
                >
                  🖨️ 台紙を印刷
                </a>
                <button className="delete-btn" onClick={() => deleteGame(gameIndex)}>削除</button>
              </div>
            </div>
            
            <div className="form-group">
              <label>ID:</label>
              <input
                type="text"
                value={game.gameId}
                onChange={(e) => updateGame(gameIndex, 'gameId', e.target.value)}
                placeholder="例: flappy_bird"
              />
              <label>説明:</label>
              <input
                type="text"
                value={game.description}
                onChange={(e) => updateGame(gameIndex, 'description', e.target.value)}
                style={{width: '50%'}}
                placeholder="このゲームの概要"
              />
            </div>

            <h3>ステップ一覧 (≡ をドラッグして並び替え)</h3>
            <div className="steps-list">
              {game.steps.map((step, stepIndex) => (
                <div 
                  key={step.id} 
                  className="admin-step-card"
                  onDragEnter={(e) => handleDragEnter(e, stepIndex, gameIndex)}
                  onDragOver={(e) => e.preventDefault()} 
                >
                  <div className="step-header">
                    <div className="step-header-left">
                      <span 
                        className="drag-handle"
                        draggable
                        onDragStart={(e) => handleDragStart(e, stepIndex)}
                        onDragEnd={handleDragEnd}
                      >
                        ☰
                      </span>
                      <span className="step-number">Step {step.id}</span>
                    </div>
                    <button className="delete-btn-sm" onClick={() => deleteStep(gameIndex, stepIndex)}>×</button>
                  </div>
                  
                  <div className="form-row">
                    <label>タイトル:</label>
                    <input
                      type="text"
                      value={step.title}
                      onChange={(e) => updateStep(gameIndex, stepIndex, 'title', e.target.value)}
                      placeholder="例: ジャンプのプログラミング"
                    />
                  </div>
                  
                  <div className="form-row">
                    <label>内容:</label>
                    <textarea
                      value={step.content}
                      onChange={(e) => updateStep(gameIndex, stepIndex, 'content', e.target.value)}
                      placeholder="このステップで学ぶ具体的なこと"
                    />
                  </div>

                  <div className="form-row">
                    <label>画像パス:</label>
                    <input
                      type="text"
                      value={step.image || ""}
                      placeholder="/images/sample.png"
                      onChange={(e) => updateStep(gameIndex, stepIndex, 'image', e.target.value)}
                    />
                  </div>
                </div>
              ))}
              
              <button className="add-step-btn" onClick={() => addStep(gameIndex)}>
                ＋ ステップを追加
              </button>
            </div>
          </div>
        ))}

        <button className="add-game-btn" onClick={addGame}>
          ＋ 新しいゲームを追加
        </button>
      </div>
    </>
  );
};

export default Admin;