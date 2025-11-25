// src/components/Admin.jsx

import { useState } from 'react';
import roadmapData from '../data/roadmapData.json';
import { Link } from 'react-router-dom';
import '../styles/Admin.css';

const Admin = () => {
  // 編集中のデータをStateで管理（初期値は今のJSONデータ）
  const [games, setGames] = useState(roadmapData);

  // --- データ操作関数 ---

  // ゲームの情報を更新
  const updateGame = (gameIndex, field, value) => {
    const newGames = [...games];
    newGames[gameIndex][field] = value;
    setGames(newGames);
  };

  // 新しいゲームを追加
  const addGame = () => {
    const newGame = {
      gameId: `new_game_${Date.now()}`,
      gameName: "新しいゲーム",
      description: "ここにゲームの説明が入ります",
      steps: []
    };
    setGames([...games, newGame]);
  };

  // ゲームを削除
  const deleteGame = (gameIndex) => {
    if (window.confirm("本当にこのゲームを削除しますか？")) {
      const newGames = games.filter((_, i) => i !== gameIndex);
      setGames(newGames);
    }
  };

  // ステップを追加
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

  // ステップの情報を更新
  const updateStep = (gameIndex, stepIndex, field, value) => {
    const newGames = [...games];
    newGames[gameIndex].steps[stepIndex][field] = value;
    setGames(newGames);
  };

  // ステップを削除し、IDを振り直す
  const deleteStep = (gameIndex, stepIndex) => {
    const newGames = [...games];
    // 削除
    newGames[gameIndex].steps = newGames[gameIndex].steps.filter((_, i) => i !== stepIndex);
    
    // IDを振り直す（1, 2, 3... と順番になるように）
    newGames[gameIndex].steps = newGames[gameIndex].steps.map((step, i) => ({...step, id: i + 1}));
    setGames(newGames);
  };

  // --- JSONダウンロード機能（マルチユーザー運用に必須） ---
  const handleDownload = () => {
    // 編集中のデータ全体をJSON文字列に変換
    const jsonString = JSON.stringify(games, null, 2);
    // Blob（ファイルのようなもの）を作成
    const blob = new Blob([jsonString], { type: "application/json" });
    // ダウンロードリンクを作成してクリックさせる
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    // ダウンロードファイル名は必ず master file と同じに
    link.download = "roadmapData.json"; 
    link.click();
    URL.revokeObjectURL(url);
    
    alert("✅ roadmapData.json をダウンロードしました。\n\nこのファイルを管理者に送ってください。");
  };

  // --- 画面描画 ---
  return (
    <>
      {/* ナビゲーションバー */}
      <div className="app-nav">
        <Link to="/">生徒用ページへ（確認）</Link>
        <span>|</span>
        <Link to="/admin" style={{backgroundColor: '#007bff'}}>管理・編集ツール</Link>
      </div>

      <div className="admin-container">
        <div className="admin-header">
          <h1>🛠️ ロードマップ作成ツール</h1>
          {/* 👇 ボタンの機能をダウンロードに戻す */}
          <button className="save-button" onClick={handleDownload}>
            ⬇️ JSONをダウンロード
          </button>
          <p className="note">
            ※編集後、ダウンロードされた <code>roadmapData.json</code> を管理者に送り、**上書き保存＋再デプロイ**を依頼してください。
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
              <button className="delete-btn" onClick={() => deleteGame(gameIndex)}>ゲーム削除</button>
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

            <h3>ステップ一覧</h3>
            <div className="steps-list">
              {game.steps.map((step, stepIndex) => (
                <div key={step.id} className="admin-step-card">
                  <div className="step-header">
                    <span className="step-number">Step {step.id}</span>
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