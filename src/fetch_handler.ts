import { getLiveRoomInfo } from './bilibili'
import {
  LIVE_SESSIONS_METRICS_CACHE_TTL,
  LIVE_SESSIONS_METRICS_PREFIX,
  LIVE_SESSION_PREFIX,
  ROOM_ID,
  SCALE_REGEX,
} from './consts'
import { getYDMStringByDate } from './utils'

export async function handleRequest(request: Request): Promise<Response> {
  const url = new URL(request.url)
  // simple routing
  switch (url.pathname) {
    case `/api/v1/lives/${ROOM_ID}/metrics/sessions/duration`:
      return await handleGetLiveSessionsDurationMetrics(request)
    case '/':
      return await handleGetIndexPage(request)
    default:
      return new Response('not found', { status: 404 })
  }
}

async function getLiveSessionDurationByDate(date: Date): Promise<number> {
  const { year, month, day } = getYDMStringByDate(date)
  const keyPrefix = `${LIVE_SESSION_PREFIX}:${year}-${month}-${day}_`
  let duration = 0.0
  for (const keyEntry of (await kvs.list({ prefix: keyPrefix })).keys) {
    const key = keyEntry.name
    const value = await kvs.get(key)
    if (value === null) {
      continue
    }

    const fromDateStr = key
      .replace(LIVE_SESSION_PREFIX + ':', '')
      .replace('_', ' ')
    // the date string in the key is a CST date but there is no time zone information,
    // convert CST(GMT+8) to UTC(GMT+0)
    const fromDate = new Date(
      new Date(fromDateStr).getTime() - 8 * 60 * 60 * 1000,
    )
    const toDate = value != '' ? new Date(value) : new Date()

    duration += toDate.getTime() - fromDate.getTime()
  }
  return duration
}

async function handleGetLiveSessionsDurationMetrics(
  request: Request,
): Promise<Response> {
  const url = new URL(request.url)
  let scale = '7d'
  const _scale = url.searchParams.get('scale')
  if (_scale !== null) {
    scale = _scale
  }
  const matchs = SCALE_REGEX.exec(scale)
  // verify input scale
  // TODO: support month
  if (
    matchs === null ||
    matchs.length != 3 ||
    matchs[2] != 'd' ||
    Number(matchs[1]) <= 0
  ) {
    return new Response(`Unrecognized parameter "scale=${scale}"`, {
      status: 400,
    })
  }
  if (Number(matchs[1]) != 7 && Number(matchs[1]) != 30) {
    return new Response(
      `Parameter "scale" only support "7d" or "30d", but: ${scale}`,
      { status: 400 },
    )
  }

  const cachedData = await kvs.get(LIVE_SESSIONS_METRICS_PREFIX + ':' + scale)
  if (cachedData !== null && cachedData != '') {
    return new Response(cachedData, {
      headers: { 'content-type': 'application/json;charset=UTF-8' },
    })
  }

  const currentDate = Date.now()
  let data = {
    labels: new Array(),
    datasets: [{ data: new Array() }],
  }
  for (let i = Number(matchs[1]); i > 0; i--) {
    const date = new Date(currentDate - i * 24 * 60 * 60 * 1000)
    const { month, day } = getYDMStringByDate(date)
    data.labels.push(`${month}/${day}`)
    const duration = await getLiveSessionDurationByDate(date)
    // convert to hour
    data.datasets[0].data.push((duration / 1000 / 60 / 60).toFixed(3))
  }

  const resultDate = JSON.stringify(data)
  await kvs.put(LIVE_SESSIONS_METRICS_PREFIX + ':' + scale, resultDate, {
    expirationTtl: LIVE_SESSIONS_METRICS_CACHE_TTL,
  })
  return new Response(resultDate, {
    headers: { 'content-type': 'application/json;charset=UTF-8' },
  })
}

async function handleGetIndexPage(request: Request): Promise<Response> {
  const url = new URL(request.url)
  const ybbFlag = url.searchParams.get('ybb')
  if (ybbFlag === null) {
    return Response.redirect(request.url + '?ybb=0', 302)
  }

  const liveInfo = await getLiveRoomInfo(ROOM_ID)
  const status = liveInfo.live_status == 1
  const faviconType = 'image/jpg'
  return new Response(
    `
<!DOCTYPE html>
<html>

<head>
  <title>nana7mi</title>
  <link 
      rel="icon" 
      type="${faviconType}" 
      href="data:${faviconType};base64,${await kvs.get('favicon')}">
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/github-markdown-css/4.0.0/github-markdown.min.css">
  <script src="https://cdnjs.cloudflare.com/ajax/libs/Chart.js/3.5.0/chart.min.js"></script>
  <style>
  body {
      box-sizing: border-box;
      min-width: 200px;
      max-width: 980px;
      margin: 0 auto;
      padding: 45px;
  }
  .heimu {
      background-color: #252525;
      color: #252525;
      text-shadow: none;
  }
  .heimu a:link {
      color: #252525;
  }
  .heimu a:visited {
      color: #252525;
  }
  </style>
</head>

<body>
  <article class="markdown-body">
  <h1>nana7mi.moe</h1>
  <h2>链接</h2>

  <ul>
      <li><b>主页：</b><a href="https://space.nana7mi.moe">https://space.nana7mi.moe</a></li>
      
      <li><b>直播间：</b><a href="https://live.nana7mi.moe">https://live.nana7mi.moe</a>
          <ul>
              <li><b>直播状态：</b>${status ? '<b>播了</b>' : '摸了'}</li>
              <li><b>房间名：</b>${liveInfo.title}</li>
              ${
                status
                  ? `<li><b>本次开播时间</b>: ${liveInfo.live_time}</li>`
                  : ''
              }
          </ul>
      </li>
      
      <li>
          <span ${ybbFlag !== '1' ? 'class="heimu"' : ''} >ybb：
              <a href="https://ybb.nana7mi.moe">https://ybb.nana7mi.moe</a>
          <span>
      </li>

      <li><b>项目地址：</b>
        <a href="https://github.com/hr3lxphr6j/nana7mi.moe">https://github.com/hr3lxphr6j/nana7mi.moe</a>
      </li>
  </ul>

  ${
    ybbFlag === '1'
      ? `<h2>ybb</h2>
  <div>
      <iframe src="//player.bilibili.com/player.html?aid=376524564&bvid=BV1wo4y1X7Tk&cid=365010431&page=1&high_quality=1" 
          scrolling="no" border="0" frameborder="no" framespacing="0" allowfullscreen="true" width="100%" height="650"></iframe>
  </div>`
      : ''
  }
  
  <h2>直播数据统计 Beta（自 2021/08/18 开始统计）</h2>
  <h3>过去 7 天每日的直播时长</h3>
  <canvas id="7days" width="400" height="200"></canvas>
  <h3>过去 30 天每日的直播时长</h3>
  <canvas id="30days" width="400" height="200"></canvas>
  <script>
      backgroundColor = [
          'rgba(255, 99, 132, 0.2)',
          'rgba(54, 162, 235, 0.2)',
          'rgba(255, 206, 86, 0.2)',
          'rgba(75, 192, 192, 0.2)',
          'rgba(153, 102, 255, 0.2)',
          'rgba(255, 159, 64, 0.2)',
          'rgba(255, 106, 126, 0.2)',
      ]
      borderColor = [
          'rgba(255, 99, 132, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(153, 102, 255, 1)',
          'rgba(255, 159, 64, 1)',
          'rgba(255, 109, 264, 1)'
      ]
      
      var xhr7d = new XMLHttpRequest();
      xhr7d.open("GET", "/api/v1/lives/${ROOM_ID}/metrics/sessions/duration?scale=7d")
      xhr7d.send()
      xhr7d.onreadystatechange = function() {
          if (this.readyState == 4 && this.status == 200) {
              var data = JSON.parse(this.responseText);
              var ctx = document.getElementById('7days').getContext('2d');
              data.datasets[0].label = "小时"
              data.datasets[0].backgroundColor = backgroundColor
              data.datasets[0].borderColor = borderColor
              data.datasets[0].borderWidth = 1
              var chart1 = new Chart(ctx, {
                  type: 'bar',
                  data: data,
                  options: {
                      scales: {
                          y: {
                              beginAtZero: true
                          }
                      }
                  }
              });
          }
      }

      var xhr30d = new XMLHttpRequest();
      xhr30d.open("GET", "/api/v1/lives/${ROOM_ID}/metrics/sessions/duration?scale=30d")
      xhr30d.send()
      xhr30d.onreadystatechange = function() {
          if (this.readyState == 4 && this.status == 200) {
              var data = JSON.parse(this.responseText);
              var ctx = document.getElementById('30days').getContext('2d');
              data.datasets[0].backgroundColor = backgroundColor
              data.datasets[0].borderColor = borderColor
              data.datasets[0].borderWidth = 1
              data.datasets[0].label = "小时"
              var chart1 = new Chart(ctx, {
                  type: 'bar',
                  data: data,
                  options: {
                      scales: {
                          y: {
                              beginAtZero: true
                          }
                      }
                  }
              });
          }
      }
  </script>

  <hr />

  <span>Contact me: <a href="mailto: chigusa@chigusa.moe">chigusa@chigusa.moe</a></span><br>
  <span>Powered by Cloudflare Workers.</span>
</article>
</body>
</html>
`,
    {
      headers: {
        'content-type': 'text/html;charset=UTF-8',
      },
    },
  )
}