const fs = require('fs');
const rows = [
  ['playlist_name','spotify_url','curator_name','followers','genre','mood','description','risk_notes','manual_status'],
  ['Melodic Bass Afterglow','https://open.spotify.com/','Unclaimed curator','8200','Melodic Bass','emotional; cinematic','Seed profile for emotional future bass','Needs curator verification','seed'],
  ['Quiet Room Lo-fi','https://open.spotify.com/','Founding curator candidate','5400','Lo-fi / Chill','soft; study','Warm instrumental loops and soft drums','Manual review before outreach','seed'],
  ['Faith for Heavy Days','https://open.spotify.com/','Unclaimed curator','3100','Christian / Inspirational','hopeful; gentle','Faith-friendly songs for heavy days','Needs owner claim','seed']
];
const csv = rows.map((row) => row.map((cell) => `"${String(cell).replaceAll('"','""')}"`).join(',')).join('\n');
fs.writeFileSync('seed-playlists.csv', csv);
console.log('Wrote seed-playlists.csv');
