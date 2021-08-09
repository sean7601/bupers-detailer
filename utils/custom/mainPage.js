let mainPage = new Object;
mainPage.enter = function(){
    let html = `<div class="card-deck mb-3 text-center row">
    <div class="card mb-4 box-shadow">
      <div class="card-header">
        <h4 class="my-0 font-weight-normal">Build Slate</h4>
      </div>
      <div class="card-body">
        <ul class="list-unstyled mt-3 mb-4">
          <li>Load folder with returned data</li>
          <li>Validate data</li>
          <li>Build/optimize slate</li>

        </ul>
        <button type="button" class="btn btn-lg btn-block btn-outline-primary" onclick="slate.enter()">Start</button>
      </div>
    </div>
    <div class="card mb-4 box-shadow">
      <div class="card-header">
        <h4 class="my-0 font-weight-normal">Edit Commands</h4>
      </div>
      <div class="card-body">
        <ul class="list-unstyled mt-3 mb-4">
          <li>List all commands</li>
          <li>Quantify personnel needs</li>
          <li>Download Excel pref sheet</li>
          <il></il>
        </ul>
        <button type="button" class="btn btn-lg btn-block btn-primary" onclick="buildCommands.enter()">Edit</button>
      </div>
    </div>
    <div class="card mb-4 box-shadow">
      <div class="card-header">
        <h4 class="my-0 font-weight-normal">Edit Personnel</h4>
      </div>
      <div class="card-body">
        <ul class="list-unstyled mt-3 mb-4">
          <li>List all personnel</li>
          <li>Quantify needs/limitations</li>
          <li>Download Excel pref sheet</li>
        </ul>
        <button type="button" class="btn btn-lg btn-block btn-primary" onclick="buildPeople.enter()">Edit</button>
      </div>
    </div>
  </div>`

  $("#content").html(html);


  html = `
  <h1 class="display-4">Detailer Tool</h1>
  <p class="lead">Quickly build standardized forms for collecting slate preferences and use the returned data to build slates that maximize fit between command needs, personnel desires, and Navy resources.</p>
  `
  $("#header").html(html);

}