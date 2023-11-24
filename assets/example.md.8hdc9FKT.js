import{_ as s,o as e,c as a,R as i}from"./chunks/framework.wqKj8LY0.js";const u=JSON.parse('{"title":"Example","description":"","frontmatter":{},"headers":[],"relativePath":"example.md","filePath":"example.md"}'),t={name:"example.md"},n=i(`<h1 id="example" tabindex="-1">Example <a class="header-anchor" href="#example" aria-label="Permalink to &quot;Example&quot;">​</a></h1><p>We provide a complete example on how to setup your graph database, connect to it, retrieve elements and display them in Ogma. And the best is that you can make it work in minutes. Let&#39;s get started:</p><div class="language-sh vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">sh</span><pre class="shiki shiki-themes github-light github-dark vp-code"><code><span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">git</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> clone</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> https://github.com/Linkurious/ogma-oracle-graph-db</span></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">cd</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> ogma-oracle-graph-db</span></span></code></pre></div><h2 id="setup-the-database" tabindex="-1">Setup the Database <a class="header-anchor" href="#setup-the-database" aria-label="Permalink to &quot;Setup the Database&quot;">​</a></h2><p>The simplest way is to use the <code>docker-compose</code> file we provide, which will:</p><ul><li>pull the Oracle SQL server image</li><li>setup the users login/password</li><li>load a database</li><li>add the SQL utility functions required by the parser</li></ul><div class="language-sh vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">sh</span><pre class="shiki shiki-themes github-light github-dark vp-code"><code><span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">cd</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> example/compose-stack</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">docker</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> compose</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> up</span></span></code></pre></div><p>And you are done ! You know have a container exposing the port <code>1521</code> on which you can execute SQL requests.</p><h2 id="start-the-server" tabindex="-1">Start the server <a class="header-anchor" href="#start-the-server" aria-label="Permalink to &quot;Start the server&quot;">​</a></h2><div class="language-sh vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">sh</span><pre class="shiki shiki-themes github-light github-dark vp-code"><code><span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">cd</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> example/server</span></span></code></pre></div><p>You will need to provide your Ogma API key to be able to install Ogma via npm install. Either by modifying the <code>package.json</code>, either by running:</p><div class="language-sh vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">sh</span><pre class="shiki shiki-themes github-light github-dark vp-code"><code><span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">npm</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> install</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> --save</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> https://get.linkurio.us/api/get/npm/ogma/</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">&lt;</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">VERSIO</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">N</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">&gt;</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">/?secret=</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">&lt;</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">YOUR_API_KE</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">Y</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">&gt;</span></span></code></pre></div><p>Then:</p><div class="language-sh vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">sh</span><pre class="shiki shiki-themes github-light github-dark vp-code"><code><span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">npm</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> install</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">npm</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> run</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> build</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> &amp;&amp; </span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">npm</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> run</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> start</span></span></code></pre></div><p>You know have an express app that answers to a few routes by querying your SQL database:</p><ul><li>[GET] /nodes/:<code>type</code> Returns all nodes of a certain type. Type must match with the labels passed in your <code>CREATE PROPERTY GRAPH</code> call.</li><li>[GET] /edges/:<code>types</code> Returns all edges of a certain type.</li><li>[GET] /node/:<code>id</code> Returns the node corresponding to <code>id</code>. Id must be of the form: <code>LABEL-ID</code>.</li><li>[GET] /edge/:<code>id</code> Returns the edge corresponding to <code>id</code></li><li>[GET /expand/:<code>id</code> Returns all the neighbors of the node refered by <code>id</code>.</li></ul><h2 id="start-the-frontend" tabindex="-1">Start the frontend <a class="header-anchor" href="#start-the-frontend" aria-label="Permalink to &quot;Start the frontend&quot;">​</a></h2><div class="language-sh vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">sh</span><pre class="shiki shiki-themes github-light github-dark vp-code"><code><span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">cd</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> example/client</span></span></code></pre></div><p>Same as for server, you will need to install Ogma by providing your <code>API_KEY</code>. Then you can just proceed:</p><div class="language-sh vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">sh</span><pre class="shiki shiki-themes github-light github-dark vp-code"><code><span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">npm</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> install</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">npm</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> run</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> dev</span></span></code></pre></div><p>You know have a frontend running on <code>http://localhost:5174/</code> which displays the graph, allows you to look into nodes/edges properties by clicking on it, and expand nodes by double clicking on it.</p><p>Enjoy!</p>`,22),l=[n];function h(p,o,d,r,c,k){return e(),a("div",null,l)}const F=s(t,[["render",h]]);export{u as __pageData,F as default};
