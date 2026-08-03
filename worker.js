function escapeHtml(str) {
  if (str == null) return '--';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function buildHTML(studentId, data, error) {
  const hasResult = data || error;
  const success = data && data.success;
  const u = data?.objectMap?.payUser ?? {};
  const bal = data?.objectMap?.accountBalance ?? [];

  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>自助网费查询</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    font-family: 'Inter', -apple-system, "Segoe UI", Roboto, "Noto Sans SC", sans-serif;
    background: linear-gradient(135deg, #f5f3ff 0%, #ede9fe 30%, #e0e7ff 60%, #f0f4ff 100%);
    color: #1e1b4b;
    display: flex; justify-content: center; align-items: center;
    min-height: 100vh; padding: 2rem 1rem;
    position: relative;
  }
  body::before {
    content: '';
    position: fixed;
    top: -50%; left: -50%;
    width: 200%; height: 200%;
    background:
      radial-gradient(ellipse at 15% 30%, rgba(139,92,246,.12) 0%, transparent 50%),
      radial-gradient(ellipse at 85% 70%, rgba(59,130,246,.10) 0%, transparent 50%),
      radial-gradient(ellipse at 50% 0%, rgba(236,201,75,.06) 0%, transparent 40%);
    z-index: 0;
    pointer-events: none;
  }
  .card {
    background: rgba(255,255,255,.75);
    backdrop-filter: blur(24px);
    -webkit-backdrop-filter: blur(24px);
    border-radius: 24px;
    width: 100%; max-width: 440px;
    box-shadow:
      0 4px 24px rgba(139,92,246,.08),
      0 16px 64px rgba(139,92,246,.06),
      inset 0 0 0 1px rgba(255,255,255,.8);
    overflow: hidden;
    position: relative;
    z-index: 1;
    transition: transform .35s cubic-bezier(.4,0,.2,1), box-shadow .35s ease;
  }
  .card:hover {
    transform: translateY(-4px);
    box-shadow:
      0 8px 32px rgba(139,92,246,.12),
      0 24px 80px rgba(139,92,246,.08),
      inset 0 0 0 1px rgba(255,255,255,.8);
  }
  .header {
    background: linear-gradient(135deg, #7c3aed 0%, #6366f1 50%, #3b82f6 100%);
    padding: 2rem 2rem 1.75rem;
    text-align: center;
    position: relative;
    overflow: hidden;
  }
  .header::before {
    content: '';
    position: absolute;
    top: 0; left: 0; right: 0; bottom: 0;
    background: linear-gradient(45deg, transparent 40%, rgba(255,255,255,.06) 50%, transparent 60%);
  }
  .header::after {
    content: '';
    position: absolute;
    top: -60%; right: -20%;
    width: 250px; height: 250px;
    background: radial-gradient(circle, rgba(255,255,255,.1) 0%, transparent 65%);
    border-radius: 50%;
  }
  .header .icon {
    font-size: 2.4rem; display: block; margin-bottom: .5rem;
    position: relative; z-index: 1;
    filter: drop-shadow(0 2px 4px rgba(0,0,0,.1));
  }
  .header h1 {
    font-size: 1.3rem; color: #fff;
    font-weight: 700; letter-spacing: -.01em;
    position: relative; z-index: 1;
    text-shadow: 0 1px 2px rgba(0,0,0,.1);
  }
  .header p {
    font-size: .82rem; color: #e0e7ff;
    margin-top: .35rem;
    position: relative; z-index: 1;
    font-weight: 400;
  }
  .body { padding: 1.5rem 1.75rem 2rem; }
  .form-row {
    display: flex; gap: .5rem; margin-bottom: 1.5rem;
    position: relative;
  }
  .form-row input {
    flex: 1; padding: .75rem 1rem; border-radius: 14px;
    border: 1.5px solid #e0e7ff;
    background: rgba(255,255,255,.8);
    color: #1e1b4b; font-size: .95rem; outline: none;
    transition: all .25s ease;
    font-family: inherit;
  }
  .form-row input::placeholder { color: #a5b4fc; }
  .form-row input:focus {
    border-color: #7c3aed;
    box-shadow: 0 0 0 4px rgba(124,58,237,.12);
    background: #fff;
  }
  .form-row button {
    padding: .75rem 1.5rem; border-radius: 14px; border: none;
    background: linear-gradient(135deg, #7c3aed, #6366f1);
    color: #fff; font-size: .9rem; cursor: pointer;
    white-space: nowrap; font-weight: 600;
    transition: all .25s ease;
    letter-spacing: .01em;
    position: relative;
    overflow: hidden;
  }
  .form-row button::before {
    content: '';
    position: absolute; inset: 0;
    background: linear-gradient(135deg, rgba(255,255,255,.15), transparent);
    opacity: 0; transition: opacity .25s;
  }
  .form-row button:hover {
    background: linear-gradient(135deg, #6d28d9, #4f46e5);
    transform: scale(1.03);
    box-shadow: 0 4px 20px rgba(124,58,237,.3);
  }
  .form-row button:hover::before { opacity: 1; }
  .form-row button:active { transform: scale(.97); }

  .result-wrap {
    animation: fadeUp .45s cubic-bezier(.4,0,.2,1);
  }
  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(16px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  .success-toast {
    text-align: center; color: #059669; font-size: .8rem;
    margin-bottom: 1rem; padding: .5rem;
    background: rgba(16,185,129,.08);
    border-radius: 10px;
    font-weight: 600;
  }
  .info-card {
    background: rgba(255,255,255,.6);
    border-radius: 16px;
    padding: .25rem 0;
    border: 1px solid rgba(139,92,246,.08);
    box-shadow: 0 1px 4px rgba(139,92,246,.04);
  }
  .row {
    display: flex; justify-content: space-between; align-items: center;
    padding: .9rem 1.2rem;
    border-bottom: 1px solid rgba(139,92,246,.06);
    transition: background .2s;
  }
  .row:last-child { border-bottom: none; }
  .row:hover { background: rgba(139,92,246,.04); }
  .label {
    color: #7c3aed; font-size: .88rem;
    display: flex; align-items: center; gap: .35rem;
    font-weight: 500;
  }
  .value {
    color: #1e1b4b; font-weight: 600; font-size: .95rem;
    text-align: right;
  }
  .name {
    font-size: 1.15rem; font-weight: 700;
    background: linear-gradient(135deg, #4f46e5, #7c3aed);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }
  .balance {
    font-size: 1.6rem; font-weight: 800;
    background: linear-gradient(135deg, #f59e0b, #d97706);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    letter-spacing: -.01em;
  }
  .balance-unit {
    font-size: .85rem; font-weight: 500;
    color: #a5b4fc;
    margin-left: .15rem;
  }

  .error {
    background: rgba(239,68,68,.06);
    color: #dc2626;
    border: 1px solid rgba(239,68,68,.12);
    border-radius: 12px;
    padding: .85rem 1rem; text-align: center;
    animation: fadeUp .3s ease;
    font-weight: 500;
  }
  .hint {
    text-align: center;
    padding: 2.5rem 0 1.5rem;
    color: #a5b4fc;
  }
  .hint-icon {
    font-size: 3rem; display: block; margin-bottom: .75rem;
    opacity: .4;
  }
  .hint p { font-size: .9rem; color: #8b5cf6; font-weight: 500; }
  .hint .sub {
    font-size: .8rem; color: #c4b5fd;
    margin-top: .3rem; font-weight: 400;
  }
  .footer {
    text-align: center; padding: 1rem 1.75rem;
    font-size: .72rem; color: #c4b5fd;
    border-top: 1px solid rgba(139,92,246,.06);
    letter-spacing: .02em;
    font-weight: 400;
  }

  @media (max-width: 480px) {
    body { padding: 0; }
    body::before { display: none; }
    .card {
      max-width: 100%;
      border-radius: 0;
      min-height: 100dvh;
      box-shadow: none;
      background: rgba(255,255,255,.9);
    }
    .card:hover { transform: none; }
    .header {
      padding: 1.5rem 1.25rem 1.25rem;
    }
    .header .icon { font-size: 1.8rem; margin-bottom: .35rem; }
    .header h1 { font-size: 1.1rem; }
    .header p { font-size: .75rem; }
    .body { padding: 1.25rem 1.25rem 1.5rem; }
    .form-row { gap: .4rem; margin-bottom: 1.25rem; }
    .form-row input {
      padding: .7rem .85rem;
      font-size: 16px;
      border-radius: 12px;
    }
    .form-row button {
      padding: .7rem 1.1rem;
      font-size: .85rem;
      border-radius: 12px;
    }
    .row { padding: .75rem 1rem; }
    .label { font-size: .82rem; }
    .value { font-size: .9rem; }
    .name { font-size: 1.05rem; }
    .balance { font-size: 1.35rem; }
    .hint { padding: 2rem 0 1rem; }
    .hint-icon { font-size: 2.5rem; }
    .footer { padding: .85rem 1.25rem; font-size: .68rem; }
  }

  @media (max-width: 380px) {
    .form-row { flex-direction: column; }
    .form-row button { width: 100%; }
    .header { padding: 1.25rem 1rem 1rem; }
    .body { padding: 1rem 1rem 1.25rem; }
    .row { padding: .65rem .85rem; flex-direction: column; align-items: flex-start; gap: .25rem; }
    .value { text-align: left; width: 100%; }
  }

  /* ========== 加载动画 ========== */
  .loading-overlay {
    display: none;
    position: absolute;
    inset: 0;
    background: rgba(255,255,255,.85);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    z-index: 100;
    justify-content: center;
    align-items: center;
    animation: fadeIn .3s ease;
  }
  .loading-overlay.active {
    display: flex;
  }
  @keyframes fadeIn {
    from { opacity: 0; }
    to   { opacity: 1; }
  }
  .loading-content {
    text-align: center;
  }
  .spinner {
    width: 48px;
    height: 48px;
    margin: 0 auto 1rem;
    border: 4px solid #e0e7ff;
    border-top-color: #7c3aed;
    border-radius: 50%;
    animation: spin .8s linear infinite;
  }
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
  .loading-text {
    color: #7c3aed;
    font-weight: 600;
    font-size: 1rem;
  }
  .loading-sub {
    color: #a5b4fc;
    font-size: .8rem;
    margin-top: .25rem;
  }

  @media (max-width: 480px) {
    .loading-overlay {
      background: rgba(255,255,255,.9);
    }
    .spinner {
      width: 40px;
      height: 40px;
      border-width: 3.5px;
    }
    .loading-text { font-size: .9rem; }
    .loading-sub { font-size: .75rem; }
  }
</style>
</head>
<body>
<div class="card">
  <div class="loading-overlay" id="loadingOverlay">
    <div class="loading-content">
      <div class="spinner"></div>
      <p class="loading-text">查询中...</p>
      <p class="loading-sub">正在获取账户信息</p>
    </div>
  </div>

  <div class="header">
    <span class="icon">⛓️</span>
    <h1>自助网费查询</h1>
    <p>中国石油大学（北京）</p>
  </div>
  <div class="body">
    <form method="post" class="form-row">
      <input type="text" name="id" placeholder="请输入学号"
             value="${escapeHtml(studentId || '')}" required>
      <button type="submit">查询</button>
    </form>

    ${hasResult ? (error ? `
      <div class="error">⚠️ ${escapeHtml(error)}</div>
    ` : success ? `
      <div class="result-wrap">
      <div class="success-toast">✅ 查询成功</div>
      <div class="info-card">
        <div class="row">
          <span class="label">👤 姓名</span>
          <span class="value"><span class="name">${escapeHtml(u.name)}</span></span>
        </div>
        <div class="row">
          <span class="label">🆔 学号</span>
          <span class="value">${escapeHtml(u.uni_no)}</span>
        </div>
        <div class="row">
          <span class="label">💰 账户余额</span>
          <span class="value">
            <span class="balance">${escapeHtml(bal[0])}</span>
            <span class="balance-unit">元</span>
          </span>
        </div>
      </div>
      </div>
      ${u.error ? `
        <div class="error" style="margin-top:1rem">⚠️ ${escapeHtml(u.error)}</div>
      ` : ''}
    ` : `
      <div class="error">⚠️ 接口返回异常</div>
    `) : `
      <div class="hint">
        <span class="hint-icon">🔍</span>
        <p>输入学号查询网费余额</p>
      </div>
    `}
  </div>
  <div class="footer">仅供学习研究 · 请勿用于非法用途 · 安全研究</div>
</div>
<script>
document.addEventListener('DOMContentLoaded', function() {
  const form = document.querySelector('form');
  const overlay = document.getElementById('loadingOverlay');
  if (form && overlay) {
    form.addEventListener('submit', function() {
      overlay.classList.add('active');
    });
  }
});
</script>
</body>
</html>`;
}

export default {
  async fetch(request, env, ctx) {
    // 设置跨域请求头（仅 JSON 模式使用）
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Content-Type': 'application/json; charset=utf-8'
    };

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    // 获取参数
    const url = new URL(request.url);
    let studentId = url.searchParams.get('id');
    let jsonMode = url.searchParams.has('json');

    // 如果是 POST，尝试从表单中读取
    if (request.method === 'POST') {
      try {
        const formData = await request.formData();
        if (!studentId) studentId = formData.get('id');
        if (!jsonMode && formData.get('json') === 'true') jsonMode = true;
      } catch (e) {
        // 不是表单数据，忽略
      }
    }

    // 无参数时返回空表单页面
    if (!studentId) {
      return new Response(buildHTML(null, null), {
        headers: { 'Content-Type': 'text/html; charset=utf-8' }
      });
    }

    // 请求学校接口
    const targetUrl = 'https://cwpt.cup.edu.cn/UOPOOrderApplyUWangFei';
    const payload = new URLSearchParams({
      'ajax': 'true',
      'act': 'search',
      'userName': studentId
    });

    try {
      const response = await fetch(targetUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        },
        body: payload.toString()
      });

      const data = await response.json();

      if (jsonMode) {
        return new Response(JSON.stringify(data), {
          status: 200,
          headers: corsHeaders
        });
      }

      return new Response(buildHTML(studentId, data), {
        headers: { 'Content-Type': 'text/html; charset=utf-8' }
      });
    } catch (err) {
      if (jsonMode) {
        return new Response(JSON.stringify({
          success: false,
          message: '请求学校接口失败-',
          error: err.message
        }), { status: 500, headers: corsHeaders });
      }

      return new Response(buildHTML(studentId, null, '请求学校接口失败: ' + err.message), {
        headers: { 'Content-Type': 'text/html; charset=utf-8' }
      });
    }
  }
};