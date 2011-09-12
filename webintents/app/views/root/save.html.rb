<% content_for(:title) do %>Save<% end %>
<% content_for(:headline) do %>Save - http://webintents.org/save<% end %>
<section>
  <p>
    The save intent is designed to give applications the ability to offer a simple mechanism to save data in their application.
  </p>
  <p>
    An action that can handle save could be anything that the user has installed, including and not limited to specialist image tools or audio players. 
  </p>
  <p>
    The "save" protocol is intended to be a lightweight save facility.
  </p>
  <h2>Registration</h2>
  <pre>&lt;intent
  <a href="#action">action</a>="http://webintents.org/save" 
  <a href="#type">type</a>="image/*" 
  <a href="#href">href</a>="save.html"
/&gt;</pre>
  <dl>
    <dt id="action">action</dt>
      <dd>Required. Must be http://webintents.org</dd>
    <dt id="type">type</dt>
      <dd>Optional. Types are a filter</dd> 
    <dt id="href">href</dt>
      <dd>Optional. If specified, it will point to the action that is loaded when the user chooses the service.  If undefined, use the current page.</dd> 
  </dl>
  <h2>Invocation</h2>
  <pre>var intent = new Intent("http://webintents.org/save");
window.navigator.startActivity(intent);</pre>
  <h2>Data Formats</h2>
  <p>Clients and services can only interact with each other if the both support the same intent AND the same data type. Data-types can be any arbitary string, but it is expected that client and service will pass the same data if they both agree to support the protocol.</p>
  <p>Advisory data-schemes are described below based off <a href="http://en.wikipedia.org/wiki/Internet_media_type" target="_blank">MIME-Types</a> or <a href="http://activitystrea.ms/head/activity-schema.html#object-types" target="_blank">Activity Streams</a></p>
  <dl id="dataformats">
    <dt>image/*</dt>
    <dd><pre>[ <i>string uri</i> ] || <i>string uri</i></pre></dd>
    <dt>audio/*</dt>
    <dd><pre>[ <i>string uri</i> ] || <i>string uri</i></pre></dd>
    <dt>video/*</dt>
    <dd><pre>[ <i>string uri</i> ] || <i>string uri</i></pre></dd>
    <dt>text/uri-list</dt>
    <dd><pre>[ <i>string uri</i> ] || <i>string uri</i></pre></dd>
  </dl>
</section>
