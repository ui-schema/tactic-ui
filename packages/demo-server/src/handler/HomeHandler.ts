import express from 'express'

const HomeHandler: express.Handler = async (_req, res) => {
    return res.send(`
  <!doctype HTML>
<html lang="en">
<head>
    <title>Tactic-UI Server</title>
    <style>
        body {
            font-family: -apple-system,system-ui,BlinkMacSystemFont,Segoe UI,Roboto,Helvetica Neue,sans-serif;
            background: #182e35;
            color: #fff;
        }
    </style>
</head>
<body>
    <h1>Tactic-UI Server</h1>
</body>
</html>`)
}

export default HomeHandler
