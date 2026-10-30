import sharp from 'sharp';
import { mkdir, writeFile } from 'node:fs/promises';
const out='assets/marketing/app-store';
await mkdir(out,{recursive:true});
const cards=[
  ['01-descubra','assets/marketing/discovery-mobile.png','Sua próxima faixa.','Fora do óbvio.','Descubra, ouça um preview e escolha o que conecta.','#11241d'],
  ['02-seu-ritmo','assets/marketing/source/filters-mobile.png','Seu momento.','Seu ritmo.','Explore por estilo, energia e momento de escuta.','#112226'],
  ['03-biblioteca','assets/marketing/source/library-mobile.png','Guarde o achado.','Volte ao play.','Encontre suas favoritas por faixa, artista ou estilo.','#1b2030']
];
for(const [name,source,line1,line2,caption,bg] of cards){
 const screenshot=await sharp(source).resize(1000,2173).png().toBuffer();
 const svg=`<svg width="1320" height="2868" xmlns="http://www.w3.org/2000/svg"><rect width="1320" height="2868" fill="${bg}"/><text x="100" y="115" fill="#c7ff6b" font-family="Arial" font-size="34" font-weight="700" letter-spacing="8">SONIC SEARCH</text><text x="100" y="270" fill="#f2f6e9" font-family="Arial" font-weight="700" font-size="108">${line1}</text><text x="100" y="390" fill="#c7ff6b" font-family="Arial" font-weight="700" font-size="108">${line2}</text><text x="100" y="485" fill="#ccdbd3" font-family="Arial" font-size="36">${caption}</text><rect x="144" y="574" width="1032" height="2205" rx="52" fill="#060d0b" stroke="#52675e" stroke-width="4"/></svg>`;
 await sharp(Buffer.from(svg)).composite([{input:screenshot,left:160,top:590}]).png().toFile(`${out}/${name}-pt-BR.png`);
}
const thumbs=await Promise.all(cards.map(async([name],i)=>({input:await sharp(`${out}/${name}-pt-BR.png`).resize(330,717).png().toBuffer(),left:i*342,top:0})));
await sharp({create:{width:1014,height:717,channels:3,background:'#101917'}}).composite(thumbs).png().toFile(`${out}/preview.png`);
console.log('Three Portuguese screenshot layout drafts generated from the native web bundle. Device verification is still required before App Store upload.');
