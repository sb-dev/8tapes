export function loadScriptAsync(url) {
  return new Promise((resolve, reject) => {
    let scriptReady = false;
      
    const script = document.createElement("script");
    script.type = "text/javascript";
    script.src = url;
    script.async = true;

    script.onload = script.onreadystatechange = function () {
      if (!scriptReady && (!this.readyState || this.readyState === "complete")) {
        scriptReady = true;
        resolve(this);
      }
    };
    
    script.onerror = script.onabort = reject;
  });
}
