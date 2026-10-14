(function(){
      try{
        var t = localStorage.getItem("krewire-theme") || "auto";
        var m = t==="auto"? (matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light") : t;
        document.documentElement.dataset.theme = m;
        document.documentElement.classList.toggle("dark", m==="dark");
      }catch(e){}
      window.krewireTheme={toggle:function(){
        var cur=document.documentElement.dataset.theme;
        var nxt=cur==="dark"?"light":"dark";
        document.documentElement.dataset.theme=nxt;
        document.documentElement.classList.toggle("dark", nxt==="dark");
        try{localStorage.setItem("krewire-theme",nxt)}catch(e){}
      }};
    })();