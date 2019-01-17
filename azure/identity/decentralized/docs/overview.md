---
uid: 6dda9f38-227a-4a60-99f1-b58343f7324d
---

<style>
.timeline {
  list-style: none;
  padding: 20px 0 20px;
  position: relative;
  margin-top: 25px;
}
.start-text {
    font-size: 15px;
    color: black;
}
.timeline:before {
  top: 0;
  bottom: 0;
  position: absolute;
  content: " ";
  width: 3px;
  background-color: #eeeeee;
  left: 50%;
  margin-left: -1.5px;
}
.timeline > li {
  margin-bottom: 20px;
  position: relative;
}
.timeline > li:before,
.timeline > li:after {
  content: " ";
  display: table;
}
.timeline > li:after {
  clear: both;
}
.timeline > li:before,
.timeline > li:after {
  content: " ";
  display: table;
}
.timeline > li:after {
  clear: both;
}
.timeline > li > .timeline-panel {
  width: 46%;
  float: left;
  border: 1px solid #d4d4d4;
  border-radius: 2px;
  padding: 20px;
  position: relative;
  top: 23px;
}
.timeline > li > .timeline-panel:before {
  position: absolute;
  top: 26px;
  right: -15px;
  display: inline-block;
  border-top: 15px solid transparent;
  border-left: 15px solid #ccc;
  border-right: 0 solid #ccc;
  border-bottom: 15px solid transparent;
  content: " ";
}
.timeline > li > .timeline-panel:after {
  position: absolute;
  top: 27px;
  right: -14px;
  display: inline-block;
  border-top: 14px solid transparent;
  border-left: 14px solid #fff;
  border-right: 0 solid #fff;
  border-bottom: 14px solid transparent;
  content: " ";
}
.timeline > li > .timeline-badge {
  color: #fff;
  width: 50px;
  height: 50px;
  line-height: 50px;
  font-size: 1.4em;
  text-align: center;
  position: absolute;
  top: 40px;
  left: 50%;
  margin-left: -25px;
  background-color: #999999;
  z-index: 100;
  border-top-right-radius: 50%;
  border-top-left-radius: 50%;
  border-bottom-right-radius: 50%;
  border-bottom-left-radius: 50%;
}
.timeline > li > .timeline-start {
  color: #fff;
  width: 80px;
  height: 80px;
  line-height: 80px;
  font-size: 1.4em;
  text-align: center;
  position: absolute;
  top: -40px;
  left: 50%;
  margin-left: -40px;
  margin-bottom: 40px;
  background-color: #e7e7e7;
  z-index: 100;
  border-top-right-radius: 50%;
  border-top-left-radius: 50%;
  border-bottom-right-radius: 50%;
  border-bottom-left-radius: 50%;
}
.timeline > li.timeline-inverted > .timeline-panel {
  float: right;
}
.timeline > li.timeline-inverted > .timeline-panel:before {
  border-left-width: 0;
  border-right-width: 15px;
  left: -15px;
  right: auto;
}
.timeline > li.timeline-inverted > .timeline-panel:after {
  border-left-width: 0;
  border-right-width: 14px;
  left: -14px;
  right: auto;
}
.timeline-badge.primary {
  background-color: #2e6da4 !important;
}
.timeline-badge.success {
  background-color: #3f903f !important;
}
.timeline-badge.warning {
  background-color: #f0ad4e !important;
}
.timeline-badge.danger {
  background-color: #d9534f !important;
}
.timeline-badge.info {
  background-color: #5bc0de !important;
}
.timeline-title {
  margin-top: 0;
  color: inherit;
  border: none;
}
.timeline-body > p,
.timeline-body > ul {
  margin-bottom: 0;
  text-align: left;
  margin-top: 15px;
}
.timeline-body > p + p {
  margin-top: 5px;

}
</style>

Decentralized identity APIs
======================

Updated: November 8, 2018

<br />

Welcome to the developer documentation for decentralized identity at Microsoft. We recommend reading a bit about [our vision for decentralized identity](https://query.prod.cms.rt.microsoft.com/cms/api/am/binary/RE2DjfY) before getting started. 

<hr />

Table of Contents:

- Overview
- Tutorials
    - [How to register a decentralized identity](xref:4d54b401-1bb0-4470-9d43-c2cb2cde1184)
    - [How to discover a decentralized identity](xref:3bf346d0-264d-4fcc-a912-154366620acf)
    - [How to enable sign in to apps with decentralized identities](xref:b8c39fd6-5021-4593-a11d-7d5867e446e5)
- Resources
    - [How to install an example user agent as a chrome extension](xref:a6b91f7e-4dac-4d20-9b1e-52d423e86feb)

<hr />

We plan to add new technologies and features to this website over time. Here are some investments we currently have planned:

<ul class="timeline">
    <li>
        <div class="timeline-start"><span class="start-text">Est. 2018</span></div>    
    </li>
    <li>
        <div class="timeline-badge light"><i class="glyphicon glyphicon-asterisk"></i></div>
        <div class="timeline-panel">
        <div class="timeline-heading">
            <h4 class="timeline-title">DID standards & test methods</h4>
            <p><small class="text-muted">October 2018</small></p>
        </div>
        <div class="timeline-body">
            <p>The W3C CCG has a <a href="https://w3c-ccg.github.io/did-spec/">draft spec for representing decentralized identities</a>, allowing identities to be registered on different distributed ledgers while maintaining compatibility. To provide a reference implementation, a test DID method is built that allows temporary <a href="/docs/registration.html">creation and usage</a> of decentralized identities. This allows additional development to continue while progress is made on real DID methods.</p>
        </div>
        </div>
    </li>
    <li class="timeline-inverted">
        <div class="timeline-badge light"><i class="glyphicon glyphicon-qrcode"></i></div>
        <div class="timeline-panel">
        <div class="timeline-heading">
            <h4 class="timeline-title">Authentication & initial APIs</h4>
            <p><small class="text-muted">November 2018</small></p>
        </div>
        <div class="timeline-body">
            <p>Protocols for authenticating decentralized identities using public key credentials are proposed. A reference implementation with javascript APIs is built that <a href="/docs/sign-in-web.html">allows a website to authenticate a decentralized identity</a>. A sample user agent application is open sourced that demonstrates proper usage of the proposed protocols using a test DID method.</p>
        </div>
        </div>
    </li>
    <li>
        <div class="timeline-badge light"><i class="glyphicon glyphicon-file"></i></div>
        <div class="timeline-panel">
        <div class="timeline-heading">
                <h4 class="timeline-title">Standardization continues</h4>
                <p><small class="text-muted">Ongoing</small></p>
            </div>
            <div class="timeline-body">
                <p>Work continues between members of the decentralized identity foundation and other standards bodies to revise, refine, and formalize standards for decentralized identities. Topics include identifiers names & discovery, authentication protocols, storage and compute, claims and credentials, and more.</p>
            </div>
            </div>
        </li>
        <li class="timeline-inverted">
            <div class="timeline-badge light"><i class="glyphicon glyphicon-cloud-upload"></i></div>
            <div class="timeline-panel">
            <div class="timeline-heading">
                <h4 class="timeline-title">Data storage in identity hubs</h4>
                <p><small class="text-muted">Coming Soon</small></p>
            </div>
            <div class="timeline-body">
                <p>Identity hubs provide secure data storage for any information associated with an identity. Profile information, personal files, government issued documents, and more. Identity hubs offer users tools for controlling and reviewing access to their data, so that information can be confidently and privately shared with other parties. Data storage and retreival is based on industry standards to ensure that users have their choice of how and where to run their identity hub. Information in identity hubs can also be replicated to multiple instances of hubs to maintain the advantages of decentralization.</p>
            </div>
            </div>
        </li>
        <li>
            <div class="timeline-badge light"><i class="glyphicon glyphicon-tree-conifer"></i></div>
            <div class="timeline-panel">
            <div class="timeline-heading">
                <h4 class="timeline-title">Scaling registration of identities</h4>
            </div>
            <div class="timeline-body">
                <p>Registration of identities on a distributed ledger typically requires a transaction to be submitted to the ledger's network. To offer decentralized identities to users at scale, a solution is needed to increase the throughput and or latency of an identity registration. SideTree is a proposed layer two protocol that can help address these problems and enable identity registration that works at real world scale.</p>
            </div>
            </div>
        </li>
        <li class="timeline-inverted">
            <div class="timeline-badge light"><i class="glyphicon glyphicon-retweet"></i></div>
            <div class="timeline-panel">
            <div class="timeline-heading">
                <h4 class="timeline-title">Key recovery mechanisms</h4>
            </div>
            <div class="timeline-body">
                <p>To use decentralized identities, users must be able to secure private keys while using them to perform daily tasks and operations. Should a private key be lost or compromise, users run the risk of losing access to all of their online assests and personal data. Mechanisms are needed to help users avoid problems with their private keys and to recover from problems when they do happen.</p>
            </div>
            </div>
        </li>
        <li>
            <div class="timeline-badge light"><i class="glyphicon glyphicon-phone"></i></div>
            <div class="timeline-panel">
            <div class="timeline-heading">
                <h4 class="timeline-title">Mobile user agents</h4>
            </div>
            <div class="timeline-body">
                <p>Easy to use and secure user agents are a critical component to decentralized identity. Mobile applications can help users secure their identity's private keys, respond to incoming requests, and manage access to their personal data.</p>
            </div>
            </div>
        </li>
        <li class="timeline-inverted">
            <div class="timeline-badge light"><i class="glyphicon glyphicon-option-horizontal"></i></div>
            <div class="timeline-panel">
            <div class="timeline-heading">
                <h4 class="timeline-title">Much more on the way!</h4>
            </div>
            <div class="timeline-body">
                <p>We'll continue to update this timeline with new technologies as they become available. If you have ideas on what you'd like to see from decentralized identities, please <a href="/">get in touch</a>.</p>
            </div>
            </div>
        </li>
    </ul>


