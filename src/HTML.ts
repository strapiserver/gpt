export const HTML = `<!DOCTYPE html>
<html>
  <head>
    <title> GPT APP </title>
  <link rel="icon" href="./favicon.ico" type="image/x-icon" />
    <style>
      body { font-family: sans-serif; padding: 20px; }
      button, input {
        font-size: 16px;
        margin: 5px 0;
        padding: 8px 16px;
        color: rgb(50, 55, 117); /* Changed font-color to color */
        border: 1px solid rgb(30, 45, 107); /* Added border to buttons and inputs */
        border-radius: 4px; /* Added border-radius for rounded corners */
      }
    </style>
  </head>
  <body>
    <h2>Run Scripts</h2>
    <button onclick="run('parsebest')">Parse Best</button>
    <button onclick="run('fillreal')">Fill Real Links</button>
    <button onclick="run('findxml')">Find XML</button>
    <button onclick="run('create')">Create Exchangers</button>
    <button onclick="run('checkhealthy')">Check Health XML</button>
    <button onclick="run('loadExchangersHTML')">Load Descriptions</button>
    <button onclick="run('fillDescriptionsFromFile')">Fill Descriptions From Files</button>
    <button onclick="run('filldirs')">Fill Dirs</button>
    <button onclick="run('fillDescriptionAuto')">Fill Descriptions Auto</button>

    <div style="margin-top: 10px;">
      <input id="sectionInput" placeholder="Enter section name" />
      <button onclick="runSection()">Fill Articles (section)</button>
    </div>

    <script>
      const base = "";

      function run(route) {
        fetch(\`\${base}/\${route}\`)
          .then(res => res.text())
          .then(res => alert("Success"))
          .catch(err => alert("Error: " + err));
      }

      function runSection() {
        const val = document.getElementById("sectionInput").value;
        if (!val) return alert("Enter section name");
        fetch(\`/section=\${encodeURIComponent(val)}\`)
          .then(res => res.text())
          .then(res => alert("Success" ))
          .catch(err => alert("Error: " + err));
      }
    </script>
  </body>
</html>`;
