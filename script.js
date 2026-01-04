document.addEventListener("DOMContentLoaded", function() {

  /* ===== FORM VALIDATION + SUCCESS MESSAGE + reCAPTCHA ===== */
  const form = document.querySelector('.contact-form');
  const successMessage = document.getElementById('success-message');

  if(form){
    form.addEventListener('submit', function(e){
      e.preventDefault();

      const name = document.getElementById('name').value.trim();
      const country = document.getElementById('country').value.trim();
      const email = document.getElementById('email').value.trim();
      const story = document.getElementById('story').value.trim();
      const privacy = document.getElementById('privacy').checked;

      // Error msgs
      const nameError = document.getElementById('name-error');
      const countryError = document.getElementById('country-error');
      const emailError = document.getElementById('email-error');
      const storyError = document.getElementById('story-error');
      const privacyError = document.getElementById('privacy-error');
      const captchaError = document.getElementById('captcha-error');

      let valid = true;

      if(!name){ nameError && (nameError.style.display='block'); valid=false; } else { nameError && (nameError.style.display='none'); }
      if(!country){ countryError && (countryError.style.display='block'); valid=false; } else { countryError && (countryError.style.display='none'); }
      if(!email){ emailError && (emailError.style.display='block'); valid=false; } else { emailError && (emailError.style.display='none'); }
      if(!story){ storyError && (storyError.style.display='block'); valid=false; } else { storyError && (storyError.style.display='none'); }
      if(!privacy){ privacyError && (privacyError.style.display='block'); valid=false; } else { privacyError && (privacyError.style.display='none'); }

      // reCAPTCHA check
      if(typeof grecaptcha !== "undefined"){
        const captchaResponse = grecaptcha.getResponse();
        if(!captchaResponse || captchaResponse.length===0){
          captchaError && (captchaError.style.display='block');
          valid = false;
        } else {
          captchaError && (captchaError.style.display='none');
        }
      }

      if(valid){
        successMessage && (successMessage.style.display='block', successMessage.style.opacity=1);

        // fade-out
        setTimeout(()=>{
          successMessage && (successMessage.style.opacity=0);
          setTimeout(()=>{ successMessage && (successMessage.style.display='none'); }, 500);
        }, 3000);

        // reset form and error msgs
        form.reset();
        [nameError, countryError, emailError, storyError, privacyError, captchaError].forEach(err=>{ if(err) err.style.display='none'; });

        // reCAPTCHA reset
        if(typeof grecaptcha !== "undefined"){ grecaptcha.reset(); }

      } else {
        successMessage && (successMessage.style.opacity=0, successMessage.style.display='none');
      }
    });
  }

  /* ===== HAMBURGER MENU ===== */
  const toggleBtn = document.querySelector(".menu-toggle");
  const navLinks = document.querySelector(".nav-links");
  if(toggleBtn && navLinks){
    toggleBtn.addEventListener("click", ()=> navLinks.classList.toggle("active"));
    window.addEventListener("scroll", ()=>{ if(navLinks.classList.contains("active")) navLinks.classList.remove("active"); });
  }

  /* ===== NAV ACTIVE LINK ===== */
  const navvLinks = document.querySelectorAll('.nav-links a');
  const currentPage = window.location.pathname.split("/").pop();
  navvLinks.forEach(link => { if(link.getAttribute('href') === currentPage) link.classList.add('active'); });

  /* ===== AUDIO PLAYER ===== */
  const player = document.getElementById('player');
  if(player){
    let currentBtn = null;
    document.querySelectorAll('.play-icon').forEach(btn=>{
      btn.addEventListener('click', ()=>{
        const audioSrc = btn.dataset.audio;
        if(currentBtn===btn && !player.paused){ player.pause(); btn.textContent='▶'; return; }
        if(currentBtn && currentBtn!==btn) currentBtn.textContent='▶';
        player.src=audioSrc; player.play();
        btn.textContent='❚❚'; currentBtn=btn;
      });
    });
    player.addEventListener('pause', ()=>{ if(currentBtn) currentBtn.textContent='▶'; });
  }

  /* ===== MODAL FOR IMAGES ===== */
  const lightbox = document.getElementById('lightbox');
  const lightboxImg = document.getElementById('lightbox-img');
  const closeBtn = document.querySelector('.close');

  document.querySelectorAll('.data-card img').forEach(img=>{
    img.addEventListener('click', ()=>{
      if(lightbox && lightboxImg){
        lightbox.style.display='flex';
        lightboxImg.src = img.src;
      }
    });
  });

  closeBtn && closeBtn.addEventListener('click', ()=>{ if(lightbox) lightbox.style.display='none'; });
  lightbox && lightbox.addEventListener('click',(e)=>{ if(e.target===lightbox) lightbox.style.display='none'; });
  

  /* ===== D3 DATA GRAPH ===== */
  const container = document.getElementById('chart-container');
  if(container){

     if(container){

    // --- Container size ---
    function getContainerSize() {
      const rect = container.getBoundingClientRect();
      return { width: Math.max(300, rect.width), height: Math.max(300, rect.height) };
    }
    let { width, height } = getContainerSize();

    // --- Data ---
    const discriminationData = [
           { name: "I. VIOLENCES ET AGRESSIONS (PHYSIQUES ET SEXUELLES)", color: "#FFD700", subcategories: [
          { name: "Violences conjugales", details: ["Violence physique","Violence sexuelle","Violence psychologique/verbale","Violence économique","Comportement contrôlant"] },
          { name: "Viol et agression sexuelle", details: ["Viol","Tentative de viol","Agression sexuelle (sans pénétration)","Harcèlement sexuel","Attentat à la pudeur"] },
          { name: "Fémicide", details: ["Fémicide direct","Fémicide indirect","Meurtres d'enfants dans le cadre d'un fémicide","Tentatives de meurtre au sein du couple"] },
          { name: "Violences dans l'espace public et outrage sexiste", details: ["Outrages sexistes","Sifflements, regards insistants, commentaires","Contact physique non consenti","Poursuite et filature","Menaces et intimidation"] }
        ]
      },
      { name: "II. CYBERVIOLENCE ET HARCÈLEMENT EN LIGNE", color: "#FF4500", subcategories: [
          { name: "Cyberviolence", details: ["Insultes en ligne","Harcèlement sexuel en ligne","Harcèlement répété et cyberharcèlement","Menaces en ligne","Diffusion d'images intimes","Sextorsion"] },
          { name: "Cyberharcèlement scolaire", details: ["Au collège","Au lycée","Visio-lynchage","Usurpation d'identité en milieu scolaire"] },
          { name: "\"Revenge porn\" et diffusion d'images", details: ["Diffusion non consentie de photos intimes","Vidéos sans consentement","Deepfakes","Chantage"] }
        ]
      },
      { name: "III. DISCRIMINATION AU TRAVAIL ET ÉCONOMIQUE", color: "#8A2BE2", subcategories: [
          { name: "Discrimination à l'embauche", details: ["Refus d'emploi en raison du sexe","Questions sur la fertilité","Discrimination liée à la grossesse"] },
          { name: "Inégalité salariale", details: ["Discrimination salariale directe","Inégalité des primes","Accès inégal aux promotions"] },
          { name: "Pénalité liée à la maternité", details: ["Refus de réintégration après congé maternité","Baisse de salaire après une naissance"] },
          { name: "Plafond de verre", details: ["Absence de femmes dans les postes de direction","Sous-représentation dans les STEM"] },
          { name: "Travail à temps partiel", details: ["Contrainte au temps partiel"] },
          { name: "Précarité", details: ["Ségrégation dans les secteurs peu rémunérés","Emploi instable"] }
        ]
      },
      { name: "IV. DISCRIMINATION RACIALE ET LIÉE À L'ORIGINE", color: "#FF0000", subcategories: [
          { name: "Islamophobie et discrimination des femmes musulmanes", details: ["Discrimination à l'embauche","Isolement et marginalisation sociale","Sexualisation et exotisation"] },
          { name: "Racisme et discrimination ethnique", details: ["Discrimination des femmes afro-françaises","Profilage racial"] },
          { name: "Discrimination des femmes migrantes", details: ["Refus d'emploi","Refus de logement","Difficultés d'accès à la protection"] }
        ]
      },
      { name: "V. SEXUALITÉ ET DROITS REPRODUCTIFS", color: "#00CED1", subcategories: [
          { name: "Mariage forcé", details: ["Mariage sans consentement","Mariage d'enfants"] },
          { name: "Mutilations génitales féminines", details: ["Excision partielle","Infibulation"] },
          { name: "Stérilisation forcée", details: ["Stérilisation sans consentement"] },
          { name: "Violences reproductives", details: ["Absence d'accès à la contraception","Sabotage de la contraception"] }
        ]
      },
      { name: "VI. DISCRIMINATION LIÉE À L'ÂGE (ÂGISME)", color: "#32CD32", subcategories: [
          { name: "Jeunes femmes (15-29 ans)", details: ["Sous-estimation de l'opinion","Commentaires sexuels","Discrimination à l'embauche"] },
          { name: "Femmes âgées (65+)", details: ["Invisibilisation sociale","Négligence médicale"] }
        ]
      },
      { name: "VII. DISCRIMINATION LIÉE À LA SANTÉ ET AU HANDICAP", color: "#808000", subcategories: [
          { name: "Femmes handicapées", details: ["Refus d'emploi","Violences sexuelles","Refus d'aménagements"] },
          { name: "Stigmatisation liée au VIH", details: ["Refus de soins","Stigmatisation sociale"] }
        ]
      },
      { name: "VIII. SEXUALITÉ ET ORIENTATION", color: "#FF69B4", subcategories: [
          { name: "Lesbophobie", details: ["Violences physiques","Violences verbales"] },
          { name: "Transphobie", details: ["Violences physiques et psychologiques","Maltraitance médicale"] },
          { name: "Discrimination des bisexuelles", details: ["Invisibilisation","Stéréotypes"] }
        ]
      },
      { name: "IX. VIOLENCES MÉDICALES ET GYNÉCOLOGIQUES", color: "#00BFFF", subcategories: [
          { name: "Violences obstétricales", details: ["Examens sans consentement","Refus d'analgésie"] },
          { name: "Violences gynécologiques", details: ["Examens brutaux","Consentement non éclairé"] }
        ]
      },
      { name: "X. EXPLOITATION SEXUELLE", color: "#9400D3", subcategories: [
          { name: "Prostitution et exploitation", details: ["Prostitution contrainte","Prostitution d'enfants"] },
          { name: "Traite des êtres humains", details: ["Traite internationale","Esclavage sexuel"] },
          { name: "Grooming", details: ["Grooming en ligne","Grooming en personne"] }
        ]
      },
      { name: "XI. VIOLENCES CULTURELLES ET SÉMIOTIQUES", color: "#F4A460", subcategories: [
          { name: "Sexualisation et objectivation", details: ["Sexualisation médiatique","Publicité sexualisante"] },
          { name: "Stéréotypes et représentation", details: ["Madone / Prostituée","Réduction de la femme à son corps"] }
        ]
      },
      { name: "XII. CONTRÔLE POLITIQUE ET SOCIAL", color: "#20B2AA", subcategories: [
          { name: "Contrôle reproductif", details: ["Restriction d'accès à l'avortement","Restriction d'accès à la contraception"] },
          { name: "Violences législatives", details: ["Lois inégales sur le divorce","Sanctions faibles contre violences"] }
        ]
      }
    ];

    // --- Build nodes & links ---
    const nodes = [];
    const links = [];
    let idCounter = 0;
    const rootId = idCounter++;
    nodes.push({ id: rootId, name:'', level:0, size:28, fx:null, fy:null, color:'#ffffff' });

    discriminationData.forEach(cluster => {
      const color = cluster.color;
      const displayCategoryName = cluster.name.replace(/^[IVX]+\.\s*/,'').trim();
      const categoryId = idCounter++;
      nodes.push({ id:categoryId, name:displayCategoryName, nameWords: displayCategoryName.split(/\s+/), level:1, size:56, color, group: cluster.name });
      links.push({ source: rootId, target: categoryId, distance:60, strength:0.08 });
      cluster.subcategories.forEach(sub => {
        const subId = idCounter++;
        nodes.push({ id:subId, name:sub.name, level:2, size:14, color, group: cluster.name });
        const dynDist = Math.min(120, 40 + sub.name.length*2.5);
        links.push({ source: categoryId, target: subId, distance: dynDist, strength:0.9 });
      });
    });

    // --- D3 setup ---
    let svg, g, simulation, currentScale = 1;
    const FONT_SIZE_L1 = 12, FONT_SIZE_L2 = 11;

    function updateTextSizes(){
      const invScale = Math.min(4, Math.max(0.8,1/currentScale));
      const baseScale = Math.min(1.6, Math.max(0.6,1/currentScale));
      const VIS_THRESHOLD = 0.9;
      const isZoomedOut = currentScale < VIS_THRESHOLD;
      d3.selectAll(".main-label tspan").style("font-size",`${FONT_SIZE_L1*invScale}px`);
      d3.selectAll(".sub-label").style("font-size",`${FONT_SIZE_L2*baseScale}px`).style("opacity",isZoomedOut?0:1);
    }

    function initializeSimulation(){
      container.innerHTML = '';
      const size = getContainerSize();
      width = size.width; height = size.height;

      svg = d3.select(container).append('svg')
        .attr('width', width).attr('height', height)
        .call(d3.zoom().scaleExtent([0.35,4]).on('zoom',(event)=>{ g.attr('transform',event.transform); currentScale=event.transform.k; updateTextSizes(); }))
        .on('dblclick.zoom', null);

      g = svg.append('g');

      simulation = d3.forceSimulation(nodes)
        .force('link', d3.forceLink(links).id(d=>d.id).distance(d=>d.distance||60).strength(d=>d.strength??1))
        .force('charge', d3.forceManyBody().strength(-150))
        .force('center', d3.forceCenter(width/2, height/2))
        .force('collision', d3.forceCollide().radius(d => (d.size||8)+(d.level===1?6:8)))
        .on('tick', ticked);

      updateGraph();
      updateTextSizes();
    }

    function updateGraph(){
      // LINKS
      const linkGroup = g.selectAll('.links').data([null]).join('g').attr('class','links');
      let linkSel = linkGroup.selectAll('line').data(links, d => `${d.source.id??d.source}-${d.target.id??d.target}`);
      linkSel.exit().transition().duration(300).attr('stroke-opacity',0).remove();
      linkSel = linkSel.enter().append('line').attr('class','link').attr('stroke-opacity',0).merge(linkSel).attr('stroke-opacity',1);

      // NODES
      const nodeGroup = g.selectAll('.nodes').data([null]).join('g').attr('class','nodes');
      let nodeSel = nodeGroup.selectAll('g.node').data(nodes,d=>d.id);
      const nodeEnter = nodeSel.enter().append('g').attr('class',d=>`node level-${d.level}`).attr('style',d=>`--node-color:${d.color};`).attr('opacity',0).call(drag(simulation));

      nodeEnter.append('circle').attr('r',d=>d.size).attr('fill',d=>d.color);

      nodeEnter.each(function(d){
        const group = d3.select(this);
        if(d.level===1){
          const text = group.append('text').attr('class','main-label').attr('text-anchor','middle').attr('x',0);
          const words = d.nameWords || String(d.name).split(/\s+/);
          const lineLimit = 16; let current=''; const lines=[];
          words.forEach(word=>{
            const test = current.length===0?word:current+' '+word;
            if(test.length<=lineLimit) current=test; else { if(current.length) lines.push(current); current=word; }
          });
          if(current.length) lines.push(current);
          lines.forEach((ln,i)=>{ text.append('tspan').attr('x',0).attr('dy',i===0?'0em':'1em').text(ln); });
          const totalLines = lines.length; text.attr('y',`${-(totalLines-1)*0.5}em`);
        } else {
          group.append('text').attr('class',d.level===2?'sub-label':'root-label').attr('dy','0.35em').attr('x',0).attr('text-anchor','middle').text(d=>d.level>=2?toSentenceCase(d.name):d.name);
        }
      });

      nodeEnter.transition().duration(400).attr('opacity',1);
      nodeSel.exit().transition().duration(300).attr('opacity',0).remove();

      simulation.nodes(nodes);
      simulation.force('link').links(links);
      simulation.alpha(1).restart();
      updateTextSizes();
    }

    function ticked(){
      g.selectAll('g.node').attr('transform',d=>`translate(${d.x},${d.y})`);
      g.selectAll('line.link').attr('x1',d=>d.source.x).attr('y1',d=>d.source.y).attr('x2',d=>d.target.x).attr('y2',d=>d.target.y);
      g.selectAll('g.node').each(function(d){
        if(d.level===2){
          const isLeft = d.x < width/2;
          const textEl = d3.select(this).select('text');
          const offset = (d.size||12)+8;
          textEl.attr('text-anchor',isLeft?'end':'start').attr('x',isLeft?-offset:offset);
        }
      });
    }

    function drag(sim){
      function started(event,d){ d.fx=d.x; d.fy=d.y; sim.alphaTarget(0.1).restart(); }
      function dragged(event,d){ d.fx=event.x; d.fy=event.y; sim.alpha(0.1).restart(); }
      function ended(event,d){ if(!event.active) sim.alphaTarget(0); }
      return d3.drag().on('start',started).on('drag',dragged).on('end',ended);
    }

    function toSentenceCase(str){ if(!str) return str; str=String(str).toLowerCase(); return str.charAt(0).toUpperCase()+str.slice(1); }

    function handleResize(){ const rect=getContainerSize(); width=rect.width;height=rect.height;if(svg){svg.attr('width',width).attr('height',height);} if(simulation){simulation.force('center',d3.forceCenter(width/2,height/2));simulation.alpha(0.6).restart();} }

    window.addEventListener('resize',()=>{ handleResize(); updateTextSizes(); });

    initializeSimulation();
    window.__d3_data = { nodes, links, simulation };

  }
  }

});



  