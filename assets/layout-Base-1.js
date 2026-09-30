(function(){
      var layout=document.getElementById('site-layout');
      var sidebar=document.getElementById('site-sidebar');
      var toggle=document.getElementById('site-sidebar-toggle');
      var close=document.getElementById('site-sidebar-close');
      var overlay=document.getElementById('site-sidebar-overlay');
      function setOpen(o){
        document.documentElement.classList.toggle('sidebar-open', o);
        if(toggle) toggle.setAttribute('aria-expanded', o?'true':'false');
        if(sidebar) sidebar.setAttribute('aria-hidden', o?'false':'true');
      }
      if(toggle) toggle.addEventListener('click', function(){ setOpen(!document.documentElement.classList.contains('sidebar-open')); });
      if(close) close.addEventListener('click', function(){ setOpen(false); });
      if(overlay) overlay.addEventListener('click', function(){ setOpen(false); });
      document.addEventListener('keydown', function(e){ if(e.key==='Escape') setOpen(false); });
      document.querySelectorAll('#site-sidebar [data-group] .toc-toggle').forEach(function(btn){
        btn.addEventListener('click', function(){
          var g=btn.closest('[data-group]');
          var open=g.classList.toggle('open');
          btn.setAttribute('aria-expanded', open?'true':'false');
          try{ localStorage.setItem('krewire-site-toc-'+g.querySelector('.toc-link').getAttribute('href'), open?'1':'0'); }catch(_){}
        });
      });
      try{
        document.querySelectorAll('#site-sidebar [data-group]').forEach(function(g){
          var href=g.querySelector('.toc-link').getAttribute('href');
          var v=localStorage.getItem('krewire-site-toc-'+href);
          if(v==='0') g.classList.remove('open');
          if(v==='1') g.classList.add('open');
        });
      }catch(_){}
    })();