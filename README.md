<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>ORDON: Deterministic Sovereign Operating Environment</title>
    <style>
        /* ORDON S-NODE ENTERPRISE ARCHITECTURE */
        :root { --bg-main: #07090e; --bg-panel: #0d111a; --border-color: #1b2333; --accent-amber: #ff9f00; --accent-blue: #0091ff; --accent-green: #00e676; --accent-red: #ff1744; --text-main: #e2e8f0; --text-muted: #64748b; }
        body { background-color: var(--bg-main); color: var(--text-main); font-family: 'Courier New', Courier, monospace; margin: 0; padding: 0; display: grid; grid-template-columns: 320px 1fr; height: 100vh; overflow: hidden; font-size: 14px; }
        
        /* SIDEBAR ВЕРТИКАЛЬ С СУВЕРЕННЫМИ ИНДЕКСАМИ */
        .sidebar { background-color: var(--bg-panel); border-right: 2px solid var(--border-color); padding: 25px; display: flex; flex-direction: column; justify-content: space-between; box-sizing: border-box; }
        .logo-block { border-bottom: 2px solid var(--border-color); padding-bottom: 20px; margin-bottom: 25px; }
        .logo-text { font-size: 24px; font-weight: 900; color: #fff; letter-spacing: -1px; }
        .nav-links { display: flex; flex-direction: column; gap: 8px; flex-grow: 1; }
        .nav-item { display: flex; align-items: center; gap: 10px; padding: 10px 12px; border: 1px solid transparent; border-radius: 6px; color: var(--text-main); text-decoration: none; font-weight: bold; cursor: pointer; transition: all 0.2s; font-size: 13px; }
        .nav-item:hover, .nav-item.active { background-color: #121824; border-color: var(--border-color); color: #fff; }
        .nav-item.active { border-left: 3px solid var(--accent-amber); }
        .nav-idx { font-size: 11px; font-weight: normal; color: var(--text-muted); line-height: 1.4; margin-top: 2px; }
        .latency-card { background-color: #090c12; border: 1px solid var(--border-color); padding: 15px; border-radius: 6px; font-size: 12px; }
        
        /* DASHBOARD WORKSPACE */
        .main-content { display: grid; grid-template-rows: 70px 1fr; height: 100vh; overflow: hidden; }
        .top-bar { background-color: var(--bg-panel); border-bottom: 2px solid var(--border-color); padding: 0 30px; display: flex; justify-content: space-between; align-items: center; }
        .top-title { font-size: 16px; font-weight: 900; letter-spacing: 1px; color: #fff; }
        .status-indicator { display: flex; align-items: center; gap: 10px; font-size: 11px; font-weight: bold; background-color: #090c12; border: 1px solid var(--border-color); padding: 6px 12px; border-radius: 4px; }
        .pulse-dot { width: 8px; height: 8px; background-color: var(--accent-green); border-radius: 50%; box-shadow: 0 0 10px var(--accent-green); }
        
        .dashboard-grid { padding: 25px; display: grid; grid-template-rows: auto 1fr; gap: 20px; overflow-y: auto; height: calc(100vh - 70px); box-sizing: border-box; }
        .stats-row { display: grid; grid-template-columns: repeat(4, 1fr); gap: 15px; }
        .stat-card { background-color: var(--bg-panel); border: 1px solid var(--border-color); padding: 20px; border-radius: 8px; border-top: 3px solid var(--accent-blue); }
        .stat-card.amber { border-top-color: var(--accent-amber); }
        .stat-card.red { border-top-color: var(--accent-red); }
        .stat-title { font-size: 11px; color: var(--text-muted); font-weight: bold; text-transform: uppercase; letter-spacing: 1px; }
        .stat-value { font-size: 26px; font-weight: 900; color: #fff; margin: 8px 0 4px 0; }
        .stat-progress { height: 4px; background-color: #121824; border-radius: 2px; margin-top: 10px; overflow: hidden; }
        .progress-fill { height: 100%; background-color: var(--accent-blue); width: 92%; }
        .stat-card.amber .progress-fill { background-color: var(--accent-amber); width: 78%; }
        
        .workspace-layout { display: grid; grid-template-columns: 1.6fr 1.4fr; gap: 20px; min-height: 460px; }
        .panel-box { background-color: var(--bg-panel); border: 1px solid var(--border-color); border-radius: 8px; padding: 20px; display: flex; flex-direction: column; }
        .panel-title-block { font-size: 13px; font-weight: 900; border-bottom: 2px solid var(--border-color); padding-bottom: 10px; margin-bottom: 15px; color: #fff; letter-spacing: 1px; display: flex; justify-content: space-between; }
        
        .kii-table { display: flex; flex-direction: column; gap: 8px; flex-grow: 1; }
        .kii-row { display: flex; justify-content: space-between; align-items: center; padding: 10px 15px; background-color: #090c12; border: 1px solid var(--border-color); border-radius: 6px; font-size: 13px; }
        .kii-status { font-weight: bold; font-size: 11px; padding: 3px 8px; border-radius: 4px; border: 1px solid transparent; }
        .status-nominal { color: var(--accent-green); border-color: rgba(0,230,118,0.3); background-color: rgba(0,230,118,0.05); }
        .status-warning { color: #eab308; border-color: rgba(234,179,8,0.3); background-color: rgba(234,179,8,0.05); }
        
        .stream-box { display: flex; flex-direction: column; justify-content: space-between; height: 100%; flex-grow: 1; }
        .stream-logs { display: flex; flex-direction: column; gap: 12px; font-size: 12px; color: #cbd5e1; }
        .log-line { border-left: 2px solid var(--accent-amber); padding-left: 10px; line-height: 1.4; }
        .log-time { color: var(--accent-amber); font-weight: bold; }
        .action-btn { background-color: #121824; border: 2px solid var(--accent-amber); color: var(--accent-amber); font-family: inherit; font-size: 13px; font-weight: 900; padding: 14px; border-radius: 6px; cursor: pointer; text-transform: uppercase; width: 100%; text-align: center; letter-spacing: 1px; margin-top: 20px; transition: all 0.2s; }
        .action-btn:hover { background-color: var(--accent-amber); color: #000; box-shadow: 0 0 25px rgba(255,159,0,0.25); }
        
        /* TERMINAL ЦЕНЗОРА */
        .terminal-container { grid-column: span 2; background-color: #090c12; border: 1px solid var(--border-color); border-radius: 8px; overflow: hidden; margin-top: 10px; }
        .terminal-header { background-color: var(--bg-panel); border-bottom: 2px solid var(--border-color); padding: 12px 20px; display: flex; align-items: center; gap: 10px; font-weight: bold; font-size: 13px; color: #fff; }
        .chat-messages { height: 260px; overflow-y: auto; padding: 20px; display: flex; flex-direction: column; gap: 15px; font-size: 14px; background-color: #05070a; }
        .sys-tag { color: var(--accent-amber); font-weight: bold; }
        .sys-box { background-color: var(--bg-panel); border: 1px solid var(--border-color); padding: 15px; border-radius: 6px; line-height: 1.6; margin-top: 5px; }
        .user-tag { color: var(--accent-blue); font-weight: bold; }
        .user-box { background-color: rgba(0,145,255,0.08); border: 1px solid rgba(0,145,255,0.2); padding: 12px; border-radius: 6px; max-width: 80%; align-self: flex-end; margin-top: 5px; }
        .input-area { padding: 15px; background-color: var(--bg-panel); border-top: 2px solid var(--border-color); display: flex; gap: 12px; }
        .cmd-input { flex: 1; background-color: #05070a; border: 1px solid var(--border-color); border-radius: 4px; padding: 10px 15px; color: #fff; font-family: inherit; font-size: 14px; }
        .cmd-input:focus { border-color: var(--accent-amber); outline: none; }
        .exec-btn { background-color: var(--accent-amber); color: #000; font-weight: 900; border: none; padding: 10px 22px; border-radius: 4px; cursor: pointer; text-transform: uppercase; font-family: inherit; font-size: 13px; }
        
        footer { background-color: #05070a; padding: 40px 20px; font-size: 14px; color: #94a3b8; border-top: 2px solid #1b2333; }
        .footer-container { max-width: 1300px; margin: 0 auto; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 35px; }
        .company-name { color: #ffffff; font-weight: bold; font-size: 18px; margin: 0 0 12px 0; }
        .passport-box { background-color: #0d111a; border: 2px solid #1b2333; padding: 25px; border-radius: 8px; font-size: 13px; line-height: 1.6; }
        .passport-title { color: #94a3b8; font-weight: bold; border-bottom: 1px solid #1b2333; padding-bottom: 10px; margin-bottom: 12px; letter-spacing: 1px; }
        .white-text { color: #ffffff; }
        .green-text { color: #00e676; font-weight: bold; }
    </style>
</head>
<body>

    <aside class="sidebar">
        <div class="top-nav-block">
            <div class="logo-block">
                <div class="logo-text">ORDON<span class="amber-dot">.</span>GOV</div>
                <div style="font-size: 10px; color: var(--text-muted); margin-top: 4px; font-weight: bold;">SOVEREIGN OS</div>
            </div>
            <nav class="nav-links">
                <div class="nav-item active">📁 Control Center</div>
                <div onclick="activateModule('АКТИВАЦИЯ: РАСЧЕТ ИНДЕКСА УДОВЛЕТВОРЕННОСТИ ЖИЗНЬЮ (ИУЖ)')" class="nav-item" style="flex-direction: column; align-items: flex-start; gap: 2px;">
                    <span style="color: var(--accent-green);">📊 Модуль 01 // ИУЖ</span>
                    <span class="nav-idx">Индекс удовлетворенности жизнью населения</span>
                </div>
                <div onclick="activateModule('АКТИВАЦИЯ: РАСЧЕТ ИНДЕКСА ЭФФЕКТИВНОСТИ ГЛАВЫ (ИЭГ)')" class="nav-item" style="flex-direction: column; align-items: flex-start; gap: 2px;">
                    <span style="color: var(--accent-amber);">📊 Модуль 02 // ИЭГ</span>
                    <span class="nav-idx">Индекс эффективности главы МО</span>
                </div>
