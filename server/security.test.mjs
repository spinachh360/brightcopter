import {test} from 'node:test';
import assert from 'node:assert/strict';
import {once} from 'node:events';
import {createApi} from './example.mjs';
import {allowedOrigins,createRateLimiter} from './security.mjs';
import {validateEnquiry,validateOrder,plainText} from '../shared/validation.ts';
import {assertPublicEnv,normalizeSiteUrl,indexingAllowed} from '../config/site.mjs';

test('public configuration cannot expose undeclared Vite keys or credential-bearing origins',()=>{
 assert.throws(()=>assertPublicEnv({VITE_PRIVATE_API_KEY:'never-public'}));
 assert.throws(()=>normalizeSiteUrl('https://user:password@example.com'));
 for(const origin of ['*','null','http://example.com','https://example.com/','https://example.com/path']) assert.throws(()=>allowedOrigins(origin));
 assert.equal(indexingAllowed({CONTEXT:'deploy-preview'}),false);
 assert.equal(indexingAllowed({CONTEXT:'production'}),true);
});
test('shared plain-text validation preserves Malayalam, removes control characters, and rejects invalid data',()=>{
 assert.equal(plainText('  കേരളം\u0000\u202e  ',100),'കേരളം');
 assert.equal(plainText('A\r\nB',100),'A B');
 assert.throws(()=>validateEnquiry({name:'A',phone:'123',details:'Hello'}));
 assert.throws(()=>validateEnquiry({name:'A',phone:'9876543210',details:'Hello',admin:true}));
 assert.throws(()=>plainText('x'.repeat(101),100));
 assert.throws(()=>validateOrder({name:'A',phone:'9876543210',email:'',address:'Road',landmark:'',city:'Thrissur',state:'Kerala',pin:'bad',note:''}));
 // Strings stay plain text; output escaping, rather than tag-stripping, prevents XSS.
 assert.equal(plainText('<script>alert(1)</script>',100),'<script>alert(1)</script>');
});
test('bounded rate limits enforce attempts and expire without trusting proxy headers',()=>{
 const allow=createRateLimiter({limit:2,windowMs:100,maxEntries:1});
 assert.equal(allow('a',0),true); assert.equal(allow('a',1),true); assert.equal(allow('a',2),false);
 assert.equal(allow('b',3),false); assert.equal(allow('b',101),true);
});
test('future API rejects hostile origins, oversized/invalid bodies and unexpected fields without claiming delivery',async()=>{
 const origin='https://brightcopter-337b5.web.app';
 const server=createApi({origins:allowedOrigins(origin),rateLimit:createRateLimiter({limit:30})});
 server.listen(0,'127.0.0.1');await once(server,'listening');
 const url=`http://127.0.0.1:${server.address().port}`;
 try {
  let response=await fetch(url+'/health',{headers:{Origin:'https://evil.example'}});assert.equal(response.status,403);assert.equal(response.headers.get('access-control-allow-origin'),null);
  response=await fetch(url+'/health',{headers:{Origin:'null'}});assert.equal(response.status,403);
  response=await fetch(url+'/api/enquiries',{method:'OPTIONS',headers:{Origin:origin,'Access-Control-Request-Method':'POST','Access-Control-Request-Headers':'Content-Type'}});assert.equal(response.status,204);assert.equal(response.headers.get('access-control-allow-origin'),origin);assert.equal(response.headers.get('access-control-allow-credentials'),null);
  response=await fetch(url+'/api/enquiries',{method:'OPTIONS',headers:{Origin:origin,'Access-Control-Request-Method':'DELETE'}});assert.equal(response.status,403);
  const post=body=>fetch(url+'/api/enquiries',{method:'POST',headers:{Origin:origin,'Content-Type':'application/json'},body:JSON.stringify(body)});
  response=await post({name:'A',phone:'9876543210',details:'x'.repeat(17000)});assert.equal(response.status,413);
  response=await post({name:'A',phone:'9876543210',details:'Hi',admin:true});assert.equal(response.status,400);
  response=await post({name:'A',phone:'9876543210',details:'Hi'});assert.equal(response.status,503);assert.equal((await response.json()).error,'SERVICE_NOT_CONFIGURED');
 } finally {await new Promise(resolve=>server.close(resolve));}
});
test('future API rate limits return 429 with retry guidance',async()=>{
 const server=createApi({origins:allowedOrigins('https://brightcopter-337b5.web.app'),rateLimit:createRateLimiter({limit:1})});
 server.listen(0,'127.0.0.1');await once(server,'listening');const url=`http://127.0.0.1:${server.address().port}`;
 try {assert.equal((await fetch(url+'/health')).status,200);const response=await fetch(url+'/health');assert.equal(response.status,429);assert.equal(response.headers.get('retry-after'),'60');}
 finally {await new Promise(resolve=>server.close(resolve));}
});
