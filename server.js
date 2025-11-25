// server.js

const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const fs = require('fs'); // ファイルの読み書きを行うモジュール

const app = express();
const PORT = 3000; // サーバーが稼働するポート番号。Reactの5173とは分ける。

// ----------------------------------------------------
// 1. ミドルウェアの設定
// ----------------------------------------------------

// JSONデータを受け取れるように設定
app.use(bodyParser.json()); 

// ----------------------------------------------------
// 2. 自動保存 API の設定 (次回実装)
// ----------------------------------------------------

// [一時的なテスト用]
app.get('/api/test', (req, res) => {
    res.json({ message: 'Server is running!' });
});
// 👇 JSONデータを受け取ってファイルに書き込むAPIを実装
app.post('/api/save-json', (req, res) => {
    const newRoadmapData = req.body; // 管理画面から送られてきたJSONデータ
    const filePath = path.join(__dirname, 'src', 'data', 'roadmapData.json');
    
    // JSONデータを整形して文字列に変換 (読みやすくするためにスペースを2つ入れる)
    const jsonString = JSON.stringify(newRoadmapData, null, 2); 

    // ファイル書き込み処理
    fs.writeFile(filePath, jsonString, (err) => {
        if (err) {
            console.error('ファイル書き込みエラー:', err);
            // サーバー側でエラーが出たら、クライアントに500エラーを返す
            return res.status(500).json({ success: false, message: 'ファイルの保存に失敗しました。' });
        }
        
        console.log('✅ roadmapData.json が正常に更新されました。');
        // 成功したら、クライアントに成功を返す
        res.json({ success: true, message: 'ロードマップデータが正常に保存されました。' });
    });
});

// ----------------------------------------------------
// 3. Reactファイルの配信設定
// ----------------------------------------------------

// Reactのビルドフォルダ（dist）のパス
const buildPath = path.join(__dirname, 'dist'); 

// Reactの静的ファイル（HTML/CSS/JSなど）を配信する
app.use(express.static(buildPath));

// どのURLにアクセスされても、Reactのindex.htmlを返す (SPA対応)
app.get(/^(?!\/api).*/, (req, res) => { 
    res.sendFile(path.join(buildPath, 'index.html'));
});

// ----------------------------------------------------
// 4. サーバーの起動
// ----------------------------------------------------

app.listen(PORT, () => {
    console.log(`\n========================================`);
    console.log(`✨ Express Server Listening on port ${PORT}`);
    console.log(`✨ Access URL: http://localhost:${PORT}`);
    console.log(`========================================\n`);
});