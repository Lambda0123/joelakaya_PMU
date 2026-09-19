
async function load(){
 const r=await fetch('data/pronostics.json',{cache:'no-store'});
 const d=await r.json();
 const race=d.race;
 document.getElementById('raceTitle').textContent=`Quinté+ — ${race.hippodrome} ${race.reunion}${race.course}`;
 document.getElementById('raceMeta').textContent=`${race.name} • ${race.date} • départ ${race.heure} • ${race.partants} partants`;
 document.getElementById('status').textContent='Données chargées';

 const sources=document.getElementById('sources');
 d.sources.forEach(s=>{
   sources.insertAdjacentHTML('beforeend',`<article class="source"><h3>${esc(s.page)}</h3><a href="${s.url}" target="_blank" rel="noopener">Voir la page source ↗</a><div class="numbers">${s.pronostic.map((n,i)=>`<span class="num" title="rang ${i+1}">${n}</span>`).join('')}</div></article>`);
 });

 const count={}, rank={};
 d.sources.forEach(s=>s.pronostic.forEach((n,i)=>{
   count[n]=(count[n]||0)+1; rank[n]=(rank[n]||0)+(i+1);
 }));
 const rows=Object.keys(count).map(Number).sort((a,b)=>count[b]-count[a] || rank[a]-rank[b]);
 const max=count[rows[0]]||1;
 document.getElementById('consensus').innerHTML=rows.map((n,i)=>{
   const avg=(rank[n]/count[n]).toFixed(1);
   return `<div class="consensus-row"><b>#${i+1}</b><strong>${n}</strong><div class="bar"><i style="width:${count[n]/max*100}%"></i></div><span>${count[n]}/${d.sources.length}</span><small>rg ${avg}</small></div>`;
 }).join('');

 const fav=rows.slice(0,8);
 const analysis=document.getElementById('analysis');
 fav.forEach(n=>{
   const f=d.horse_factors[String(n)];
   analysis.insertAdjacentHTML('beforeend',`<article class="horse"><strong>${n} — ${f?.nom||'Cheval '+n}</strong><div class="factor">Forme : ${f?.forme||'—'}</div><div class="factor">Cote observée : ${f?.cote_snapshot||'—'}</div><p>${f?.note||'Convergence issue des sources.'}</p></article>`);
 });

 const t=fav.slice(0,5).join(' — ');
 const top4=fav.slice(0,4).join(' — ');
 const top3=fav.slice(0,3).join(' — ');
 document.getElementById('bets').innerHTML=[
  ['Simple gagnant',`n°${fav[0]}`],
  ['Simple placé',`n°${fav[0]} / n°${fav[1]}`],
  ['Couplé',`${fav[0]} — ${fav[1]}`],
  ['2 sur 4',`${fav[0]} — ${fav[1]} — ${fav[2]} — ${fav[3]}`],
  ['Tiercé',top3],
  ['Quarté+',top4],
  ['Quinté+',t],
  ['Multi',fav.slice(0,6).join(' — ')]
 ].map(x=>`<article class="bet"><h3>${x[0]}</h3><div class="ticket">${x[1]}</div></article>`).join('');

 const real=d.official_result;
 document.getElementById('result').innerHTML=`<p class="muted">Arrivée enregistrée pour cette course :</p><div class="result">${real.map((n,i)=>`<span class="num real">${n}</span>`).join('')}</div><p class="muted">Comparaison : les résultats réels restent indépendants de toute synthèse de pronostics.</p>`;
}
function esc(s){return String(s).replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]))}
load().catch(e=>{document.getElementById('status').textContent='Erreur de chargement';console.error(e)});
