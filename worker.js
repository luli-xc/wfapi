export default {
  async fetch(request, env, ctx) {
    // 设置跨域请求头，允许任何前端页面调用
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Content-Type': 'application/json; charset=utf-8'
    };

    // 处理浏览器的 CORS 预检请求
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    // 从 URL 参数中获取学号，例如：https://your-worker.workers.dev/?id=
    const url = new URL(request.url);
    const studentId = url.searchParams.get('id') || url.searchParams.get('userName');

    if (!studentId) {
      return new Response(JSON.stringify({
        success: false,
        message: '请提供学号'
      }), { status: 400, headers: corsHeaders });
    }

    // 构造请求转发给学校服务器
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

      // 返回结果给前端
      return new Response(JSON.stringify(data), {
        status: 200,
        headers: corsHeaders
      });
    } catch (err) {
      return new Response(JSON.stringify({
        success: false,
        message: '请求学校接口失败',
        error: err.message
      }), { status: 500, headers: corsHeaders });
    }
  }
};