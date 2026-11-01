import {initializeApp} from 'https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js';
import {getAuth,onAuthStateChanged,signInWithEmailAndPassword,createUserWithEmailAndPassword,signOut,sendPasswordResetEmail} from 'https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js';
import {getFirestore,doc,getDoc,setDoc,addDoc,updateDoc,deleteDoc,collection,getDocs,query,where,orderBy} from 'https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js';
import {getStorage,ref,uploadBytes,getDownloadURL} from 'https://www.gstatic.com/firebasejs/10.14.1/firebase-storage.js';
import {firebaseConfig,useStorage} from './firebase-config.js';
const $=s=>document.querySelector(s),app=$('#app');
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
if(firebaseConfig.apiKey.startsWith('COLLE')){app.innerHTML='<p class="card2">Configuration manquante : ouvre <b>firebase-config.js</b> et colle la config de ton projet Firebase (voir README).</p>';throw new Error('config')}
const fb=initializeApp(firebaseConfig),auth=getAuth(fb),db=getFirestore(fb),storage=getStorage(fb);
const ST={nouveau:'Nouveau',confirme:'Confirmé',refuse:'Refusé',termine:'Terminé'},fdate=d=>d?d.split('-').reverse().join('/'):'';
const MSG={'auth/invalid-credential':'E-mail ou mot de passe incorrect','auth/email-already-in-use':'Cet e-mail a déjà un compte','auth/weak-password':'Mot de passe trop court (6 caractères minimum)','auth/invalid-email':'E-mail invalide','permission-denied':'Action non autorisée','auth/too-many-requests':'Trop d’essais, réessayez plus tard'};
const emsg=e=>MSG[e.code]||e.message;
const ls=(k,d)=>{try{return JSON.parse(localStorage.getItem(k))||d}catch(e){return d}};
const S={me:null,cfg:{nom:'EMP location',adresse:'Haute-Loire (43)',tel:'',email:'',intro:'Matériel disponible à la location. Demandez votre devis gratuit en quelques clics.',mentions:''},P:[],cart:ls('cart',[]),f:{q:'',cat:'',sort:'nom',dispo:false},tab:'dash',edit:null,D:[],A:null};
const keep=()=>{try{localStorage.setItem('cart',JSON.stringify(S.cart))}catch(e){}};
const list=async(q)=>(await getDocs(q)).docs.map(d=>({id:d.id,...d.data()}));
async function refreshMe(){const u=auth.currentUser;if(!u){S.me=null;return}const d=await getDoc(doc(db,'users',u.uid));S.me=d.exists()?{uid:u.uid,...d.data()}:{uid:u.uid,email:u.email,role:'client',actif:true,soc:''}}
async function load(){const c=await getDoc(doc(db,'config','site'));if(c.exists())Object.assign(S.cfg,c.data());document.title=S.cfg.nom;
 S.P=(await list(collection(db,'products'))).filter(p=>p.visible!==false).map(p=>({photos:[],manuals:[],...p}));S.cart=S.cart.filter(c=>S.P.some(p=>p.id==c.id));keep()}
function chrome(){$('#hd').innerHTML=`<a class="brand" href="#/">${esc(S.cfg.nom)}</a><nav><a href="#/">Catalogue</a><a href="#/panier">Mon devis (${S.cart.reduce((a,c)=>a+c.n,0)})</a>${S.me?(S.me.role=='admin'?'<a href="#/admin">Administration</a>':'<a href="#/devis">Mes devis</a>')+'<a href="#/" data-act="logout">Déconnexion</a>':'<a href="#/connexion">Connexion</a>'}</nav>`;
 $('#ft').innerHTML=`<b>${esc(S.cfg.nom)}</b> · ${esc(S.cfg.adresse)}${S.cfg.tel?' · '+esc(S.cfg.tel):''}${S.cfg.email?' · <a href="mailto:'+esc(S.cfg.email)+'">'+esc(S.cfg.email)+'</a>':''}<div>${esc(S.cfg.mentions)}</div>`}
async function route(){const[,p,id]=location.hash.slice(1).split('/');chrome();window.scrollTo(0,0);
 const v={'':cat,p:prod,panier:cartV,connexion:loginV,inscription:regV,devis:mine,admin:adm}[p||''];try{await(v||cat)(id)}catch(e){app.innerHTML='<p class="err">'+esc(emsg(e))+'</p>'}}
const card=p=>`<a class="card" href="#/p/${p.id}">${p.photos[0]?`<img src="${esc(p.photos[0])}" alt="" loading="lazy">`:'<div class="ph">Pas de photo</div>'}${p.vedette?'<span class="badge">À la une</span>':''}<b>${esc(p.nom)}</b><span class="tag">${esc(p.cat||'Divers')}</span><span class="${p.qte>0?'ok':'ko'}">${p.qte>0?p.qte+' en stock':'Indisponible'}</span></a>`;
async function cat(){const cs=[...new Set(S.P.map(p=>p.cat).filter(Boolean))].sort();
 app.innerHTML=`<section class="hero"><h1>${esc(S.cfg.nom)}</h1><p>${esc(S.cfg.intro)}</p></section><div class="bar"><input id="q" placeholder="Rechercher un appareil…" value="${esc(S.f.q)}">
 <select id="fc"><option value="">Toutes catégories</option>${cs.map(c=>`<option ${S.f.cat==c?'selected':''}>${esc(c)}</option>`).join('')}</select>
 <select id="fs"><option value="nom">Nom A-Z</option><option value="new" ${S.f.sort=='new'?'selected':''}>Nouveautés</option></select><label class="ck"><input type="checkbox" id="fd" ${S.f.dispo?'checked':''}> En stock seulement</label></div><div id="grid" class="grid"></div>`;grid()}
function grid(){const l=S.P.filter(p=>(p.nom+' '+p.ref+' '+p.cat+' '+p.desc).toLowerCase().includes(S.f.q.toLowerCase())&&(!S.f.cat||p.cat==S.f.cat)&&(!S.f.dispo||p.qte>0));
 l.sort((a,b)=>(b.vedette?1:0)-(a.vedette?1:0)||(S.f.sort=='new'?(b.cree||0)-(a.cree||0):a.nom.localeCompare(b.nom)));$('#grid').innerHTML=l.map(card).join('')||'<p class="mu">Aucun appareil trouvé.</p>'}
async function prod(id){const p=S.P.find(x=>x.id==id);if(!p){app.innerHTML='<p>Appareil introuvable.</p>';return}const rel=S.P.filter(x=>x.cat==p.cat&&x.id!=id).slice(0,4);
 app.innerHTML=`<a href="#/">← Catalogue</a><div class="pg"><div><div class="main">${p.photos[0]?`<img id="big" src="${esc(p.photos[0])}" alt="">`:'<div class="ph big">Pas de photo</div>'}</div><div class="th">${p.photos.length>1?p.photos.map(u=>`<img src="${esc(u)}" data-act="thumb" alt="">`).join(''):''}</div></div>
 <div><h1>${esc(p.nom)}</h1><p class="mu">Réf. ${esc(p.ref||'-')} · ${esc(p.cat||'Divers')}</p><p class="${p.qte>0?'ok':'ko'}">${p.qte>0?p.qte+' en stock':'Indisponible'}</p><p class="pre">${esc(p.desc)}</p>
 ${p.specs?`<h3>Caractéristiques</h3><ul>${p.specs.split('\n').filter(Boolean).map(x=>'<li>'+esc(x)+'</li>').join('')}</ul>`:''}
 ${p.manuals.length?`<h3>Documents</h3>${p.manuals.map(m=>`<a href="${esc(m.url)}" target="_blank" rel="noopener">📄 ${esc(m.nom)}</a>`).join('<br>')}`:''}
 <div class="row"><input type="number" id="qn" min="1" value="1" style="width:80px"><button class="p" data-act="add" data-id="${p.id}" ${p.qte>0?'':'disabled'}>Ajouter au devis</button></div></div></div>
 ${rel.length?`<h2>Dans la même catégorie</h2><div class="grid">${rel.map(card).join('')}</div>`:''}`}
async function cartV(){if(!S.cart.length){app.innerHTML='<h1>Mon devis</h1><p class="mu">Votre panier est vide. <a href="#/">Voir le catalogue</a></p>';return}const u=S.me||{};
 app.innerHTML=`<h1>Mon devis</h1><div class="card2">${S.cart.map((c,i)=>{const p=S.P.find(x=>x.id==c.id);return`<div class="row"><b style="flex:1">${esc(p.nom)}</b><input type="number" min="1" value="${c.n}" data-act="qty" data-i="${i}" style="width:80px"><button class="d" data-act="del" data-i="${i}">✕</button></div>`}).join('')}
 ${S.me?`<form data-form="devis" class="f"><input name="soc" placeholder="Société / nom" value="${esc(u.soc||'')}" required><input name="tel" placeholder="Téléphone" value="${esc(u.tel||'')}">
 <div class="row"><label style="flex:1">Du<input type="date" name="d1" required></label><label style="flex:1">Au<input type="date" name="d2" required></label></div><textarea name="nt" rows="3" placeholder="Remarques"></textarea><button class="p">Générer le devis (PDF)</button></form>`
 :`<p>Pour générer votre devis, <a href="#/connexion">connectez-vous</a> ou <a href="#/inscription">créez un compte</a>.</p>`}</div>`}
const authForm=(t,fields,b)=>`<form data-form="${t}" class="f card2 lg"><b>${b}</b>${fields}<button class="p">${b}</button><span class="err" id="fe"></span></form>`;
async function loginV(){app.innerHTML=authForm('login','<input name="email" type="email" placeholder="E-mail" autocomplete="username" required><input name="password" type="password" placeholder="Mot de passe" autocomplete="current-password" required>','Connexion')+'<p style="text-align:center"><a href="#/inscription">Créer un compte</a> · <a href="#/connexion" data-act="reset">Mot de passe oublié</a></p>'}
async function regV(){app.innerHTML=authForm('reg','<input name="soc" placeholder="Société / nom" required><input name="email" type="email" placeholder="E-mail" required><input name="password" type="password" placeholder="Mot de passe (6 car. min)" required><input name="tel" placeholder="Téléphone">','Créer un compte')}
const dTable=(l,a)=>`<div class="sc"><table>${l.map(d=>`<tr><td><b>${esc(d.num)}</b><div class="mu">${new Date(d.ts).toLocaleDateString('fr-FR')}</div>${a?'<div>'+esc(d.soc)+'</div><div class="mu">'+esc(d.tel)+' '+esc(d.email)+'</div>':''}</td><td>${d.items.map(i=>esc(i.nom)+' ×'+i.n).join('<br>')}<div class="mu">${esc(d.nt)}</div></td><td>${fdate(d.d1)} → ${fdate(d.d2)}</td>
 <td>${a?`<select data-act="st" data-id="${d.id}">${Object.entries(ST).map(([k,v])=>`<option value="${k}" ${d.statut==k?'selected':''}>${v}</option>`).join('')}</select><input data-act="note" data-id="${d.id}" placeholder="Note interne" value="${esc(d.note)}">`:ST[d.statut]}<div class="row"><button data-act="pdf" data-id="${d.id}">PDF</button>${a?`<button class="d" data-act="deld" data-id="${d.id}">Suppr.</button>`:''}</div></td></tr>`).join('')||'<tr><td class="mu">Aucun devis.</td></tr>'}</table></div>`;
async function mine(){if(!S.me){location.hash='#/connexion';return}S.D=(await list(query(collection(db,'devis'),where('uid','==',S.me.uid)))).sort((a,b)=>b.ts-a.ts);S.A=null;app.innerHTML='<h1>Mes devis</h1>'+dTable(S.D,false)}
function pdf(d){const{jsPDF}=window.jspdf,o=new jsPDF(),c=S.cfg;let y=22;o.setFontSize(22);o.text(c.nom,15,y);o.setFontSize(10);o.text([c.adresse,c.tel,c.email].filter(Boolean).join(' - '),15,y+6);
 o.setFontSize(16);o.text('DEVIS DE LOCATION',195,y,{align:'right'});o.setFontSize(10);o.text('N° '+d.num+' - '+new Date(d.ts).toLocaleDateString('fr-FR'),195,y+6,{align:'right'});
 y+=24;o.setFontSize(11);o.text('Client : '+d.soc,15,y);o.text('Tél : '+(d.tel||'-'),15,y+6);o.text('Période : du '+fdate(d.d1)+' au '+fdate(d.d2),15,y+12);y+=24;
 o.setFillColor(230,230,230);o.rect(15,y-5,180,8,'F');o.setFont(undefined,'bold');o.text('Réf.',17,y);o.text('Désignation',50,y);o.text('Qté',185,y);o.setFont(undefined,'normal');y+=9;
 d.items.forEach(i=>{if(y>265){o.addPage();y=20}o.text(String(i.ref||''),17,y);o.text(o.splitTextToSize(i.nom,125)[0],50,y);o.text(String(i.n),185,y);y+=7});y+=6;
 if(d.nt){const t=o.splitTextToSize('Remarques : '+d.nt,175);o.text(t,15,y);y+=t.length*5+4}
 o.setFont(undefined,'bold');o.text('Prestation de location gratuite - aucun tarif applicable.',15,y+6);o.setFont(undefined,'normal');o.setFontSize(9);o.text('Devis établi à titre informatif, sous réserve de disponibilité du matériel.',15,y+13);o.save(d.num+'.pdf')}
async function adm(){if(!S.me||S.me.role!='admin'){location.hash='#/connexion';return}
 const A=S.A={products:(await list(collection(db,'products'))).map(p=>({photos:[],manuals:[],...p})),users:await list(collection(db,'users')),devis:await list(query(collection(db,'devis'),orderBy('ts','desc')))};
 const nv=A.devis.filter(d=>d.statut=='nouveau').length;
 let h=`<div class="row">${[['dash','Tableau de bord'],['prod','Produits ('+A.products.length+')'],['dev','Devis'+(nv?' ('+nv+')':'')],['cli','Clients'],['cfg','Réglages']].map(([k,l])=>`<button class="${S.tab==k?'on':''}" data-act="tab" data-t="${k}">${l}</button>`).join('')}</div>`;
 if(S.tab=='dash')h+=`<div class="kpi"><div>${A.products.length}<small>appareils</small></div><div>${nv}<small>nouveaux devis</small></div><div>${A.devis.length}<small>devis au total</small></div><div>${A.users.length}<small>comptes</small></div></div><div class="row" style="margin-top:20px"><button data-act="csv">Exporter les devis (CSV)</button></div>`;
 else if(S.tab=='prod'){const e=S.edit||(S.edit={photos:[],manuals:[],visible:true});h+=`<form data-form="prod" class="f card2"><b>${e.id?'Modifier : '+esc(e.nom):'Ajouter un appareil'}</b><input name="nom" placeholder="Nom" required value="${esc(e.nom||'')}">
 <div class="row"><input name="ref" placeholder="Référence" value="${esc(e.ref||'')}" style="flex:1"><input name="cat" placeholder="Catégorie" value="${esc(e.cat||'')}" style="flex:1"><input name="qte" type="number" min="0" placeholder="Quantité" required value="${e.qte??''}" style="flex:1"></div>
 <textarea name="desc" rows="4" placeholder="Description">${esc(e.desc||'')}</textarea><textarea name="specs" rows="3" placeholder="Caractéristiques (une par ligne)">${esc(e.specs||'')}</textarea>
 <label class="ck"><input type="checkbox" name="vedette" ${e.vedette?'checked':''}> Mettre à la une</label><label class="ck"><input type="checkbox" name="visible" ${e.visible!==false?'checked':''}> Visible dans le catalogue</label>
 <div class="mu">Photos (plusieurs possibles)</div><div class="thumbs">${e.photos.map((u,i)=>`<span><img src="${esc(u)}" alt=""><b data-act="rmph" data-i="${i}">×</b></span>`).join('')}</div><input type="file" id="pf" accept="image/*" multiple>
 <div class="mu">Manuels / notices</div>${e.manuals.map((m,i)=>`<div>📄 ${esc(m.nom)} <a href="#" data-act="rmman" data-i="${i}">retirer</a></div>`).join('')}${useStorage?'<input type="file" id="pm" accept="application/pdf" multiple>':'<button type="button" data-act="addlink">Ajouter un lien vers un manuel</button>'}
 <div class="row"><button class="p">Enregistrer</button>${e.id?'<button type="button" data-act="cancel">Annuler</button>':''}</div></form>
 <div class="sc"><table>${A.products.map(p=>`<tr><td>${p.photos[0]?`<img src="${esc(p.photos[0])}" width="48" height="48" style="object-fit:cover;border-radius:6px" alt="">`:''}</td><td><b>${esc(p.nom)}</b>${p.visible===false?' <span class="tag">masqué</span>':''}<div class="mu">${esc(p.ref)} · ${esc(p.cat)}</div></td><td>Qté ${p.qte}</td><td><button data-act="editp" data-id="${p.id}">Modifier</button> <button class="d" data-act="delp" data-id="${p.id}">Suppr.</button></td></tr>`).join('')}</table></div>`}
 else if(S.tab=='dev')h+=dTable(A.devis,true);
 else if(S.tab=='cli')h+=`<form data-form="acc" class="f card2"><b>Créer un compte client</b><div class="row"><input name="email" type="email" placeholder="E-mail" required style="flex:1"><input name="password" placeholder="Mot de passe (6 car. min)" required style="flex:1"></div>
 <div class="row"><input name="soc" placeholder="Société / nom" required style="flex:1"><input name="tel" placeholder="Téléphone" style="flex:1"></div><button class="p">Créer</button></form>
 <div class="sc"><table>${A.users.map(a=>`<tr><td><b>${esc(a.soc)}</b>${a.role=='admin'?' <span class="tag">admin</span>':''}<div class="mu">${esc(a.email)} · ${esc(a.tel)}</div></td><td>${A.devis.filter(d=>d.uid==a.id).length} devis</td><td>${a.actif?'Actif':'<b>Désactivé</b>'}</td>
 <td>${a.id==S.me.uid?'(vous)':`<button data-act="togg" data-id="${a.id}">${a.actif?'Désactiver':'Activer'}</button> <button data-act="role" data-id="${a.id}">${a.role=='admin'?'Retirer admin':'Rendre admin'}</button> <button class="d" data-act="dela" data-id="${a.id}">Suppr.</button>`}</td></tr>`).join('')}</table></div>`;
 else{const c=S.cfg;h+=`<form data-form="cfg" class="f card2"><b>Informations du site</b><input name="nom" value="${esc(c.nom)}" placeholder="Nom"><input name="adresse" value="${esc(c.adresse)}" placeholder="Adresse / zone"><input name="tel" value="${esc(c.tel)}" placeholder="Téléphone"><input name="email" value="${esc(c.email)}" placeholder="E-mail">
 <textarea name="intro" rows="3" placeholder="Texte d’accueil">${esc(c.intro)}</textarea><textarea name="mentions" rows="3" placeholder="Mentions légales (pied de page)">${esc(c.mentions)}</textarea><button class="p">Enregistrer</button></form>`}
 app.innerHTML=h}
function shrink(f){return new Promise((ok,ko)=>{const i=new Image(),u=URL.createObjectURL(f);i.onload=()=>{const k=Math.min(1,900/Math.max(i.width,i.height)),c=document.createElement('canvas');c.width=i.width*k;c.height=i.height*k;c.getContext('2d').drawImage(i,0,0,c.width,c.height);URL.revokeObjectURL(u);ok(c.toDataURL('image/jpeg',.7))};i.onerror=()=>ko(new Error('Image illisible'));i.src=u})}
async function upload(f){if(!useStorage)return shrink(f);const r=ref(storage,'media/'+Date.now()+'-'+f.name.replace(/[^\w.-]/g,'_'));await uploadBytes(r,f);return getDownloadURL(r)}
function keepForm(){const f=document.querySelector('[data-form=prod]');if(!f)return;const d=new FormData(f);Object.assign(S.edit,{nom:d.get('nom'),ref:d.get('ref'),cat:d.get('cat'),qte:d.get('qte'),desc:d.get('desc'),specs:d.get('specs'),vedette:!!d.get('vedette'),visible:!!d.get('visible')})}
const stop=e=>{alert(emsg(e))},cloned=o=>JSON.parse(JSON.stringify(o));
document.addEventListener('input',e=>{if(e.target.id=='q'){S.f.q=e.target.value;grid()}});
document.addEventListener('change',async e=>{const t=e.target,a=t.dataset.act;try{
 if(t.id=='fc'){S.f.cat=t.value;grid()}else if(t.id=='fs'){S.f.sort=t.value;grid()}else if(t.id=='fd'){S.f.dispo=t.checked;grid()}
 else if(a=='qty'){S.cart[t.dataset.i].n=Math.max(1,parseInt(t.value)||1);keep();chrome()}
 else if(a=='st')await updateDoc(doc(db,'devis',t.dataset.id),{statut:t.value});else if(a=='note')await updateDoc(doc(db,'devis',t.dataset.id),{note:t.value});
 else if(t.id=='pf'||t.id=='pm'){keepForm();for(const f of t.files){const u=await upload(f);t.id=='pf'?S.edit.photos.push(u):S.edit.manuals.push({nom:f.name.replace(/\.pdf$/i,''),url:u})}route()}
}catch(x){stop(x)}});
document.addEventListener('click',async e=>{const t=e.target.closest('[data-act]');if(!t||t.tagName=='SELECT'||t.tagName=='INPUT')return;const a=t.dataset.act,id=t.dataset.id,i=+t.dataset.i;try{
 if(a=='logout'){await signOut(auth);S.me=null;S.edit=null;route()}
 else if(a=='reset'){e.preventDefault();const m=document.querySelector('[name=email]').value;if(!m)return alert('Tapez d’abord votre e-mail.');await sendPasswordResetEmail(auth,m);alert('E-mail de réinitialisation envoyé.')}
 else if(a=='thumb')$('#big').src=t.src;
 else if(a=='add'){const n=Math.max(1,parseInt($('#qn').value)||1),c=S.cart.find(x=>x.id==id);c?c.n+=n:S.cart.push({id,n});keep();location.hash='#/panier'}
 else if(a=='del'){S.cart.splice(i,1);keep();route()}
 else if(a=='pdf'){pdf((S.A?S.A.devis:S.D).find(d=>d.id==id))}
 else if(a=='tab'){S.tab=t.dataset.t;route()}
 else if(a=='rmph'){keepForm();S.edit.photos.splice(i,1);route()}else if(a=='rmman'){e.preventDefault();keepForm();S.edit.manuals.splice(i,1);route()}
 else if(a=='addlink'){const u=prompt('Adresse (URL) du manuel PDF :');if(u){keepForm();S.edit.manuals.push({nom:prompt('Nom affiché :','Manuel d’utilisation')||'Manuel',url:u});route()}}
 else if(a=='cancel'){S.edit=null;route()}else if(a=='editp'){S.edit=cloned(S.A.products.find(p=>p.id==id));route()}
 else if(a=='delp'&&confirm('Supprimer cet appareil ?')){await deleteDoc(doc(db,'products',id));await load();route()}
 else if(a=='deld'&&confirm('Supprimer ce devis ?')){await deleteDoc(doc(db,'devis',id));route()}
 else if(a=='togg'){const u=S.A.users.find(x=>x.id==id);await updateDoc(doc(db,'users',id),{actif:!u.actif});route()}
 else if(a=='role'){const u=S.A.users.find(x=>x.id==id);await updateDoc(doc(db,'users',id),{role:u.role=='admin'?'client':'admin'});route()}
 else if(a=='dela'&&confirm('Supprimer ce compte ? (la personne ne pourra plus utiliser le site)')){await updateDoc(doc(db,'users',id),{actif:false});await deleteDoc(doc(db,'users',id));route()}
 else if(a=='csv'){const q=v=>'"'+String(v??'').replace(/"/g,'""')+'"',r=['Numero;Date;Client;Telephone;Email;Du;Au;Statut;Materiel'];
  S.A.devis.forEach(d=>r.push([d.num,new Date(d.ts).toLocaleDateString('fr-FR'),d.soc,d.tel,d.email,d.d1,d.d2,d.statut,d.items.map(i=>i.nom+' x'+i.n).join(' | ')].map(q).join(';')));
  const l=document.createElement('a');l.href=URL.createObjectURL(new Blob(['\ufeff'+r.join('\r\n')],{type:'text/csv'}));l.download='devis.csv';l.click()}
}catch(x){stop(x)}});
document.addEventListener('submit',async e=>{const f=e.target,t=f.dataset.form;if(!t)return;e.preventDefault();const d=Object.fromEntries(new FormData(f));try{
 if(t=='login'){try{await signInWithEmailAndPassword(auth,d.email,d.password)}catch(x){$('#fe').textContent=emsg(x);return}await refreshMe();location.hash=S.me.role=='admin'?'#/admin':'#/panier';route()}
 else if(t=='reg'){try{const c=await createUserWithEmailAndPassword(auth,d.email,d.password);await setDoc(doc(db,'users',c.user.uid),{email:d.email,soc:d.soc,tel:d.tel||'',role:'client',actif:true,cree:Date.now()})}catch(x){$('#fe').textContent=emsg(x);return}await refreshMe();location.hash='#/panier';route()}
 else if(t=='devis'){if(d.d2<d.d1)return alert('La date de fin doit être après le début.');const ts=Date.now(),num='D-'+new Date(ts).toISOString().slice(0,10).replace(/-/g,'')+'-'+String(ts).slice(-4);
  const items=S.cart.map(c=>{const p=S.P.find(x=>x.id==c.id);return{ref:p.ref||'',nom:p.nom,n:c.n}});
  const v={num,uid:S.me.uid,email:S.me.email,soc:d.soc,tel:d.tel,d1:d.d1,d2:d.d2,nt:d.nt,items,statut:'nouveau',note:'',ts};await addDoc(collection(db,'devis'),v);
  updateDoc(doc(db,'users',S.me.uid),{soc:d.soc,tel:d.tel}).catch(()=>{});pdf(v);S.cart=[];keep();await refreshMe();location.hash='#/devis';route()}
 else if(t=='prod'){keepForm();const b=S.edit,data={nom:b.nom,ref:b.ref||'',cat:b.cat||'',desc:b.desc||'',specs:b.specs||'',qte:Math.max(0,parseInt(b.qte)||0),vedette:!!b.vedette,visible:b.visible!==false,photos:b.photos,manuals:b.manuals,cree:b.cree||Date.now()};
  if(JSON.stringify(data).length>900000)return alert('Fiche trop lourde pour la base (trop de photos). Retirez-en une ou activez Firebase Storage.');
  b.id?await setDoc(doc(db,'products',b.id),data):await addDoc(collection(db,'products'),data);S.edit=null;await load();route()}
 else if(t=='acc'){const a2=getAuth(initializeApp(firebaseConfig,'second'+Date.now()));const c=await createUserWithEmailAndPassword(a2,d.email,d.password);await signOut(a2);
  await setDoc(doc(db,'users',c.user.uid),{email:d.email,soc:d.soc,tel:d.tel||'',role:'client',actif:true,cree:Date.now()});route()}
 else if(t=='cfg'){await setDoc(doc(db,'config','site'),d);Object.assign(S.cfg,d);route()}
}catch(x){stop(x)}});
window.addEventListener('hashchange',route);
let first=true;onAuthStateChanged(auth,async()=>{await refreshMe();if(first){first=false;try{await load()}catch(x){app.innerHTML='<p class="err">'+esc(emsg(x))+'</p>';return}route()}});
