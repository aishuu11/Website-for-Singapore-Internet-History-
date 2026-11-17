(function () {
  'use strict';

  var imageSizeKb = 64;
  var experience = document.getElementById('experience');
  var connections = {
    dialup: {
      label: 'Dial-up',
      speedKbps: 56,
      display: '56 kbps',
      era: '1990s',
      imageUrl: 'https://images.unsplash.com/photo-1525625293386-3f8f99389edd?auto=format&fit=crop&w=480&q=20'
    },
    adsl: {
      label: 'ADSL',
      speedKbps: 1500,
      display: '1.5 Mbps',
      era: '2000s',
      imageUrl: 'https://images.unsplash.com/photo-1525625293386-3f8f99389edd?auto=format&fit=crop&w=800&q=40'
    },
    fibre: {
      label: 'Fibre',
      speedKbps: 100000,
      display: '100 Mbps',
      era: '2010s',
      imageUrl: 'https://images.unsplash.com/photo-1525625293386-3f8f99389edd?auto=format&fit=crop&w=1200&q=65'
    },
    '5g': {
      label: '5G',
      speedKbps: 1000000,
      display: '1 Gbps',
      era: 'Today',
      imageUrl: 'https://images.unsplash.com/photo-1525625293386-3f8f99389edd?auto=format&fit=crop&w=1600&q=85'
    }
  };

  var scene = document.getElementById('scene');
  var loadMask = document.getElementById('loadMask');
  var progressBar = document.getElementById('progressBar');
  var progressTrack = document.querySelector('.progress-track');
  var statusText = document.getElementById('statusText');
  var statusDot = document.querySelector('.status-dot');
  var speedReadout = document.getElementById('speedReadout');
  var loadedReadout = document.getElementById('loadedReadout');
  var timeReadout = document.getElementById('timeReadout');
  var heroTime = document.getElementById('heroTime');
  var telemetryNote = document.getElementById('telemetryNote');
  var footerMessage = document.getElementById('footerMessage');
  var soundToggle = document.getElementById('soundToggle');
  var requestButton = document.getElementById('requestButton');
  var skipButton = document.getElementById('skipButton');
  var consoleStatus = document.getElementById('consoleStatus');
  var revealMessage = document.getElementById('revealMessage');
  var nextPrompt = document.getElementById('nextPrompt');
  var comparisonBars = document.getElementById('comparisonBars');
  var comparisonMultipliers = document.getElementById('comparisonMultipliers');
  var storyPart = document.getElementById('storyPart');
  var enterStory = document.getElementById('enterStory');
  var enterHomeButton = document.getElementById('enterHomeButton');
  var doorwayTrigger = document.getElementById('doorwayTrigger');
  var roomIntro = document.querySelector('.room-intro');
  var firstConnection = document.getElementById('firstConnection');
  var roomScene = document.querySelector('.room-scene');
  var roomObjects = document.querySelectorAll('.room-object');
  var roomKicker = document.getElementById('roomKicker');
  var roomStoryTitle = document.getElementById('roomStoryTitle');
  var roomStoryCopy = document.getElementById('roomStoryCopy');
  var roomProgress = document.getElementById('roomProgress');
  var computerStatus = document.getElementById('computerStatus');
  var computerPage = document.getElementById('computerPage');
  var userGrowth = document.getElementById('userGrowth');
  var userCount = document.getElementById('userCount');
  var houseIcons = document.getElementById('houseIcons');
  var nextChapter = document.getElementById('nextChapter');
  var roomTracker = document.getElementById('roomTracker');
  var roomTrackerTop = document.getElementById('roomTrackerTop');
  var followCable = document.getElementById('followCable');
  var cableJourney = document.getElementById('cableJourney');
  var exitRoom = document.getElementById('exitRoom');
  var nextObject = document.getElementById('nextObject');
  var backToRoom = document.getElementById('backToRoom');
  var continueChapter3 = document.getElementById('continueChapter3');
  var executeTrace = document.getElementById('executeTrace');
  var traceStatus = document.getElementById('traceStatus');
  var traceBytes = document.getElementById('traceBytes');
  var traceRows = document.querySelectorAll('.trace-row');
  var traceNodes = document.querySelectorAll('.trace-node');
  var traceTopology = document.querySelector('.trace-topology');
  var chapter3 = document.getElementById('chapter3');
  var sendSignal = document.getElementById('sendSignal');
  var continueChapter4 = document.getElementById('continueChapter4');
  var broadbandProgress = document.getElementById('broadbandProgress');
  var broadbandSteps = document.querySelectorAll('.broadband-step');
  var speedValue = document.getElementById('speedValue');
  var speedUnit = document.getElementById('speedUnit');
  var speedEra = document.getElementById('speedEra');
  var speedCaption = document.getElementById('speedCaption');
  var pillarTabs = document.querySelectorAll('.pillar-tab');
  var pillarValue = document.getElementById('pillarValue');
  var pillarLabel = document.getElementById('pillarLabel');
  var pillarCaption = document.getElementById('pillarCaption');
  var indexBars = document.querySelectorAll('.index-bar');
  var indexResponse = document.getElementById('indexResponse');
  var chapter4 = document.getElementById('chapter4');
  var webCards = document.querySelectorAll('.web-card');
  var webCount = document.getElementById('webCount');
  var webStatus = document.getElementById('webStatus');
  var continueChapter5 = document.getElementById('continueChapter5');
  var pocketSteps = document.querySelectorAll('.pocket-step');
  var pocketYear = document.getElementById('pocketYear');
  var pocketStory = document.getElementById('pocketStory');
  var pocketSpeed = document.getElementById('pocketSpeed');
  var pocketTickerProgress = document.getElementById('pocketTickerProgress');
  var chapter5 = document.getElementById('chapter5');
  var alwaysCards = document.querySelectorAll('.always-card');
  var alwaysTitle = document.getElementById('alwaysTitle');
  var alwaysCopy = document.getElementById('alwaysCopy');
  var meterObject = document.getElementById('meterObject');
  var meterCost = document.getElementById('meterCost');
  var meterMinutes = document.getElementById('meterMinutes');
  var triedCount = document.getElementById('triedCount');
  var connectionButtons = document.querySelectorAll('.connection');
  var selectedEra = 'dialup';
  var animationFrame;
  var audioContext;
  var soundOn = false;
  var hasStarted = false;
  var testedEras = {};
  var exploredObjects = {};
  var billingInterval;
  var billingMinutes = 0;
  var billingRate = 0.05;

  function zoomToObject(object) {
    var roomBounds = roomScene.getBoundingClientRect();
    var objectBounds = object.getBoundingClientRect();
    var originX = objectBounds.left - roomBounds.left + (objectBounds.width / 2);
    var originY = objectBounds.top - roomBounds.top + (objectBounds.height / 2);
    roomScene.style.transformOrigin = originX + 'px ' + originY + 'px';
    roomScene.classList.remove('is-zooming');
    window.requestAnimationFrame(function () {
      roomScene.classList.add('is-zooming');
      window.setTimeout(function () {
        roomScene.classList.remove('is-zooming');
      }, 780);
    });
  }

  function closeRoomFocus() {
    roomScene.classList.remove('is-focused', 'is-zooming');
    roomScene.removeAttribute('data-focus');
    roomScene.style.transformOrigin = '';
    roomObjects.forEach(function (item) { item.classList.remove('is-inspected'); });
  }

  function setRoomFrame(frame) {
    roomScene.dataset.frame = frame;
    roomScene.classList.remove('frame-change');
    window.requestAnimationFrame(function () {
      roomScene.classList.add('frame-change');
    });
  }

  function startBillingMeter() {
    if (billingInterval) return;
    billingInterval = window.setInterval(function () {
      billingMinutes += 1;
      meterCost.textContent = 'S$' + (billingMinutes * billingRate).toFixed(2);
      meterMinutes.textContent = String(Math.floor(billingMinutes / 60)).padStart(2, '0') + ':' + String(billingMinutes % 60).padStart(2, '0') + ' online';
    }, 1000);
  }

  function paintComputerPage() {
    computerPage.querySelectorAll('span').forEach(function (line) {
      line.style.opacity = '0';
    });
    roomScene.classList.remove('computer-online');
    window.requestAnimationFrame(function () {
      roomScene.classList.add('computer-online');
    });
  }

  function unlockCableJourney() {
    if (Object.keys(exploredObjects).length === 3) {
      followCable.hidden = false;
      nextChapter.hidden = false;
    }
  }

  function animateUserGrowth() {
    userGrowth.hidden = false;
    houseIcons.innerHTML = '';
    for (var i = 0; i < 32; i += 1) {
      var house = document.createElement('i');
      houseIcons.appendChild(house);
    }
    var startedAt = performance.now();
    var duration = 2600;
    function tickGrowth(now) {
      var progress = Math.min((now - startedAt) / duration, 1);
      var eased = 1 - Math.pow(1 - progress, 3);
      var count = Math.round(1500 + (100000 - 1500) * eased);
      userCount.textContent = count.toLocaleString();
      houseIcons.querySelectorAll('i').forEach(function (house, index) {
        house.classList.toggle('is-lit', index / 32 < progress);
      });
      if (progress < 1) {
        window.requestAnimationFrame(tickGrowth);
      } else {
        roomStoryCopy.textContent = 'By mid-1996, SingNet had around 100,000 users. The connection was no longer a curiosity in one room.';
        nextChapter.hidden = false;
      }
    }
    window.requestAnimationFrame(tickGrowth);
  }

  function formatTime(seconds) {
    if (seconds < 0.1) return '0.0 sec';
    return seconds < 10 ? seconds.toFixed(1) + ' sec' : Math.ceil(seconds) + ' sec';
  }

  function formatResultTime(seconds) {
    return seconds < 0.1 ? 'less than 0.1 s' : seconds.toFixed(1) + ' s';
  }

  function formatCompactTime(seconds) {
    if (seconds >= 1) return '≈ ' + seconds.toFixed(1) + ' s';
    return '≈ ' + Math.max(1, Math.round(seconds * 1000)) + ' ms';
  }

  function renderConnectionWaits() {
    connectionButtons.forEach(function (button) {
      var connection = connections[button.dataset.era];
      button.querySelector('.connection-wait').textContent = formatCompactTime((imageSizeKb * 8) / connection.speedKbps);
    });
  }

  function renderComparison() {
    var tested = Object.keys(testedEras);
    triedCount.textContent = tested.length + ' of 4 tried';
    if (window.d3) {
      renderD3Comparison(tested);
      return;
    }
    comparisonBars.innerHTML = '';
    comparisonMultipliers.innerHTML = '';
    tested.sort(function (a, b) {
      return testedEras[b] - testedEras[a];
    }).forEach(function (era) {
      var item = document.createElement('div');
      item.className = 'comparison-item';
      var label = document.createElement('span');
      label.className = 'comparison-label';
      label.textContent = connections[era].label;
      var track = document.createElement('span');
      track.className = 'comparison-track';
      var fill = document.createElement('span');
      fill.className = 'comparison-fill';
      var seconds = testedEras[era];
      var width = Math.max(4, ((Math.log10(Math.max(seconds, 0.001)) + 3) / 5) * 100);
      fill.style.width = Math.min(width, 100) + '%';
      track.appendChild(fill);
      var value = document.createElement('span');
      value.className = 'comparison-value';
      value.textContent = formatCompactTime(seconds);
      item.appendChild(label);
      item.appendChild(track);
      item.appendChild(value);
      comparisonBars.appendChild(item);
    });
    if (testedEras.dialup) {
      tested.filter(function (era) { return era !== 'dialup'; }).forEach(function (era) {
        var multiplier = Math.round(connections[era].speedKbps / connections.dialup.speedKbps);
        var line = document.createElement('div');
        line.textContent = connections[era].label + ' was about ' + multiplier.toLocaleString() + '× faster than dial-up';
        comparisonMultipliers.appendChild(line);
      });
    }

  }

  function renderD3Comparison(tested) {
    var d3 = window.d3;
    var rows = tested.map(function (era) {
      return { era: era, seconds: testedEras[era], label: connections[era].label };
    }).sort(function (a, b) { return b.seconds - a.seconds; });
    var width = 300;
    var scale = d3.scaleLog().domain([0.001, 10]).range([8, width]);
    var bars = d3.select(comparisonBars);
    bars.selectAll('*').remove();
    var items = bars.selectAll('.comparison-item')
      .data(rows, function (d) { return d.era; })
      .enter()
      .append('div')
      .attr('class', 'comparison-item');
    items.append('span').attr('class', 'comparison-label').text(function (d) { return d.label; });
    var tracks = items.append('span').attr('class', 'comparison-track');
    tracks.append('span')
      .attr('class', 'comparison-fill')
      .style('width', function (d) { return scale(Math.max(d.seconds, 0.001)) + 'px'; });
    items.append('span')
      .attr('class', 'comparison-value')
      .text(function (d) { return formatCompactTime(d.seconds); });
    var multiplierBox = d3.select(comparisonMultipliers);
    multiplierBox.selectAll('*').remove();
    if (testedEras.dialup) {
      tested.filter(function (era) { return era !== 'dialup'; }).forEach(function (era) {
        var multiplier = Math.round(connections[era].speedKbps / connections.dialup.speedKbps);
        multiplierBox.append('div').text(connections[era].label + ' was about ' + multiplier.toLocaleString() + '× faster than dial-up');
      });
    }
  }

  function playTone(frequency, duration) {
    if (!soundOn) return;
    audioContext = audioContext || new (window.AudioContext || window.webkitAudioContext)();
    var oscillator = audioContext.createOscillator();
    var gain = audioContext.createGain();
    oscillator.frequency.value = frequency;
    oscillator.type = 'sine';
    gain.gain.setValueAtTime(0.0001, audioContext.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.035, audioContext.currentTime + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, audioContext.currentTime + duration);
    oscillator.connect(gain);
    gain.connect(audioContext.destination);
    oscillator.start();
    oscillator.stop(audioContext.currentTime + duration);
  }

  function renderProgress(progress, connection, totalSeconds) {
    var remaining = Math.max(totalSeconds * (1 - progress), 0);
    loadMask.style.transform = 'scaleY(' + (1 - progress) + ')';
    progressBar.style.transform = 'scaleX(' + progress + ')';
    progressTrack.setAttribute('aria-valuenow', Math.round(progress * 100));
    loadedReadout.textContent = progress >= 1 ? 'Yes' : 'Not yet';
    timeReadout.textContent = progress >= 1 ? 'complete' : formatTime(remaining);
    heroTime.textContent = progress >= 1 ? '0.0' : Math.max(remaining, 0).toFixed(1);
    statusText.textContent = progress >= 1 ? 'Photo received' : 'Receiving the photo via ' + connection.label;
    statusDot.classList.toggle('is-loading', progress < 1);
    var activeButton = document.querySelector('.connection.is-selected');
    if (activeButton) activeButton.style.setProperty('--fill', (progress * 100) + '%');
  }

  function applyEraVisual(era) {
    var connection = connections[era];
    scene.dataset.era = era;
    scene.src = connection.imageUrl;
    scene.alt = connection.era + ' visualisation of Singapore loading via ' + connection.label;
  }

  function finishLoading(connection, totalSeconds) {
    playTone(620, 0.2);
    footerMessage.textContent = connection.label + ' finished loading.';
    scene.classList.add('is-revealed');
    revealMessage.textContent = 'That photograph took ' + formatResultTime(totalSeconds) + ' to arrive.';
    testedEras[selectedEra] = totalSeconds;
    var testedButton = document.querySelector('.connection[data-era="' + selectedEra + '"]');
    if (testedButton) {
      testedButton.classList.add('is-tried');
      testedButton.querySelector('.connection-action').textContent = 'TRIED';
    }
    renderComparison();
    if (Object.keys(testedEras).length === Object.keys(connections).length) {
      nextPrompt.classList.add('is-visible');
      enterHomeButton.hidden = false;
      footerMessage.textContent = 'All connections tested — choose when to continue.';
    }
    experience.classList.add('show-controls');
  }

  function startLoading(era) {
    var connection = connections[era];
    selectedEra = era;
    hasStarted = true;
    applyEraVisual(era);
    experience.classList.add('is-transmitting');
    experience.classList.remove('show-controls');
    window.cancelAnimationFrame(animationFrame);
    connectionButtons.forEach(function (button) {
      button.classList.toggle('is-selected', button.dataset.era === era);
      button.disabled = false;
      button.style.setProperty('--fill', '0%');
    });

    var totalSeconds = (imageSizeKb * 8) / connection.speedKbps;
    requestButton.innerHTML = 'Request the photo again <span aria-hidden="true">↗</span>';
    speedReadout.textContent = connection.label + ' connection';
    timeReadout.textContent = formatTime(totalSeconds);
    heroTime.textContent = totalSeconds.toFixed(1);
    loadedReadout.textContent = 'Not yet';
    telemetryNote.textContent = 'Watch one photograph arrive using the ' + connection.label + ' connection.';
    footerMessage.textContent = connection.label + ' selected — press the button to request the photo.';
    revealMessage.textContent = '';
    nextPrompt.classList.remove('is-visible');
    scene.classList.remove('is-revealed');
    consoleStatus.innerHTML = '<span>&gt;</span> THE PHOTO IS ARRIVING<span class="cursor" aria-hidden="true">_</span>';
    consoleStatus.classList.add('is-active');
    scene.classList.toggle('is-fast', totalSeconds < 0.2);
    loadMask.style.transition = 'none';
    loadMask.style.transform = 'scaleY(1)';
    progressBar.style.transition = 'none';
    progressBar.style.transform = 'scaleX(0)';
    playTone(110, 0.15);

    var startedAt = performance.now();
    var lastToneProgress = 0;
    function tick(now) {
      var progress = Math.min((now - startedAt) / (totalSeconds * 1000), 1);
      renderProgress(progress, connection, totalSeconds);
      if (progress - lastToneProgress > 0.12) {
        playTone(160 + (progress * 260), 0.06);
        lastToneProgress = progress;
      }
      if (progress < 1) {
        animationFrame = window.requestAnimationFrame(tick);
      } else {
        consoleStatus.innerHTML = '<span>&gt;</span> YOUR PHOTO HAS ARRIVED';
        consoleStatus.classList.remove('is-active');
        finishLoading(connection, totalSeconds);
      }
    }
    animationFrame = window.requestAnimationFrame(tick);
  }

  document.getElementById('connectionGrid').addEventListener('click', function (event) {
    var button = event.target.closest('.connection');
    if (button) startLoading(button.dataset.era);
  });

  requestButton.addEventListener('click', function () {
    startLoading(selectedEra);
  });

  skipButton.addEventListener('click', function () {
    if (!hasStarted) startLoading(selectedEra);
    window.cancelAnimationFrame(animationFrame);
    var connection = connections[selectedEra];
    renderProgress(1, connection, 0);
    consoleStatus.innerHTML = '<span>&gt;</span> YOUR PHOTO HAS ARRIVED';
    consoleStatus.classList.remove('is-active');
    finishLoading(connection, 0);
  });

  enterHomeButton.addEventListener('click', function () {
    storyPart.hidden = false;
    storyPart.classList.add('is-visible');
    enterStory.click();
  });

  enterStory.addEventListener('click', function () {
    roomIntro.hidden = true;
    roomScene.hidden = false;
    roomScene.classList.remove('room-opening');
    window.requestAnimationFrame(function () { roomScene.classList.add('room-opening'); });
    window.setTimeout(function () { roomScene.classList.remove('room-opening'); }, 950);
    roomScene.classList.add('room-awake');
    roomScene.dataset.frame = '0';
    startBillingMeter();
    firstConnection.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });

  doorwayTrigger.addEventListener('click', function () {
    enterStory.click();
  });

  doorwayTrigger.addEventListener('keydown', function (event) {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      enterStory.click();
    }
  });

  roomObjects.forEach(function (object) {
    object.addEventListener('click', function () {
      var objectId = object.id;
      zoomToObject(object);
      roomScene.classList.add('is-focused');
      roomScene.dataset.focus = objectId;
      exploredObjects[objectId] = true;
      roomTracker.textContent = Object.keys(exploredObjects).length + ' of 3 explored';
      roomTrackerTop.textContent = Object.keys(exploredObjects).length + ' OF 3 OBJECTS EXPLORED';
      unlockCableJourney();
      nextObject.textContent = 'NEXT OBJECT →';
      nextObject.classList.remove('is-final');
      roomObjects.forEach(function (item) { item.classList.remove('is-inspected'); });
      object.classList.add('is-inspected');
      if (objectId === 'telephoneObject') {
        setRoomFrame(1);
        roomKicker.textContent = 'TELEPHONE LINE: OCCUPIED';
        roomStoryTitle.textContent = 'One line for the whole family.';
        roomStoryCopy.textContent = 'In 1994, one phone line served the whole family. When someone went online, nobody else could use the phone.';
        roomProgress.style.transform = 'scaleX(.28)';
        roomScene.classList.add('phone-occupied', 'phone-ringing', 'connection-cut');
        computerStatus.textContent = 'LINE INTERRUPTED';
        startBillingMeter();
        return;
      }
      if (objectId === 'modemObject') {
        setRoomFrame(2);
        roomKicker.textContent = 'THE MODEM IS CONNECTING';
        roomStoryTitle.textContent = 'Every minute online cost money.';
        roomStoryCopy.textContent = 'The modem connected the computer through the phone line. Its loud beeps meant the connection was being made, and time online was charged by the minute.';
        roomProgress.style.transform = 'scaleX(.62)';
        roomScene.classList.add('modem-active');
        roomScene.classList.remove('phone-ringing', 'connection-cut');
        computerStatus.textContent = 'OFFLINE';
        playTone(260, .2);
        window.setTimeout(function () { playTone(440, .24); }, 220);
        return;
      }
      setRoomFrame(3);
      roomKicker.textContent = 'THE FIRST PAGE';
      roomStoryTitle.textContent = 'A slow window to the wider world.';
      roomStoryCopy.textContent = 'A web page arrived bit by bit. You could watch the words and pictures slowly appear on the screen.';
      roomProgress.style.transform = 'scaleX(1)';
      computerStatus.textContent = 'ONLINE';
      nextObject.textContent = 'EXIT ROOM & CONTINUE ↓';
      nextObject.classList.add('is-final');
      roomScene.classList.remove('phone-ringing', 'connection-cut');
      paintComputerPage();
      roomScene.classList.add('computer-online');
      playTone(620, .2);
      animateUserGrowth();
      unlockCableJourney();
    });

  });

  exitRoom.addEventListener('click', function () {
    closeRoomFocus();
    roomScene.hidden = true;
    roomIntro.hidden = false;
    roomIntro.scrollIntoView({ behavior: 'smooth', block: 'center' });
  });

  nextObject.addEventListener('click', function () {
    if (roomScene.dataset.focus === 'computerObject') {
      followCable.click();
      return;
    }
    var objectIds = ['telephoneObject', 'modemObject', 'computerObject'];
    var currentIndex = objectIds.indexOf(roomScene.dataset.focus);
    var nextIndex = currentIndex < 0 ? 0 : (currentIndex + 1) % objectIds.length;
    document.getElementById(objectIds[nextIndex]).click();
  });

  backToRoom.addEventListener('click', function () {
    closeRoomFocus();
    nextObject.textContent = 'NEXT OBJECT →';
    nextObject.classList.remove('is-final');
  });

  meterObject.addEventListener('click', function () {
    zoomToObject(meterObject);
    roomScene.classList.add('is-focused');
    roomScene.dataset.focus = 'modemObject';
    roomObjects.forEach(function (item) { item.classList.remove('is-inspected'); });
    document.getElementById('modemObject').classList.add('is-inspected');
    meterObject.classList.toggle('is-inspected');
    startBillingMeter();
    roomKicker.textContent = 'SINGNET: METER RUNNING';
    roomStoryTitle.textContent = 'Every minute on the clock cost money.';
    roomStoryCopy.textContent = 'Early SingNet plans charged by the minute on top of phone call rates, turning every slow webpage load into a race against the clock.';
    roomProgress.style.transform = 'scaleX(.46)';
  });

  followCable.addEventListener('click', function () {
    cableJourney.hidden = false;
    roomScene.classList.add('cable-mode');
    cableJourney.classList.remove('is-travelling');
    roomTracker.textContent = '3 of 3 explored: signal followed';
    executeTrace.disabled = false;
    continueChapter3.hidden = true;
    traceStatus.textContent = 'The signal is waiting at home.';
    traceBytes.textContent = '000000';
    traceRows.forEach(function (row) { row.classList.remove('is-active', 'is-complete'); });
    traceNodes.forEach(function (node) { node.classList.remove('is-active'); });
    traceTopology.classList.remove('is-live');
  });

  executeTrace.addEventListener('click', function () {
    executeTrace.disabled = true;
    traceTopology.classList.add('is-live');
    traceStatus.textContent = 'The signal is leaving home...';
    var startedAt = performance.now();
    var byteTimer = window.setInterval(function () {
      var progress = Math.min((performance.now() - startedAt) / 3200, 1);
      traceBytes.textContent = String(Math.round(64000 * progress)).padStart(6, '0');
      if (progress >= 1) window.clearInterval(byteTimer);
    }, 80);
    [0, 1, 2].forEach(function (index) {
      window.setTimeout(function () {
        if (index > 0) traceRows[index - 1].classList.add('is-complete');
        traceRows[index].classList.add('is-active');
        traceNodes[index].classList.add('is-active');
        traceStatus.textContent = [
          'The signal is leaving home...',
          'The signal is crossing Singapore...',
          'The signal is reaching the wider world.'
        ][index];
      }, index * 1050);
    });
    window.setTimeout(function () {
      traceRows[2].classList.add('is-complete');
      traceStatus.textContent = 'The signal has reached the wider world.';
      continueChapter3.hidden = false;
    }, 3250);
  });

  continueChapter3.addEventListener('click', function () {
    chapter3.hidden = false;
    chapter3.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });

  sendSignal.addEventListener('click', function () {
    sendSignal.disabled = true;
    var milestones = [
      { value: '56', unit: 'kbps', era: 'DIAL-UP / 1994', caption: 'The line was something you waited beside.' },
      { value: '1,500', unit: 'kbps', era: 'ADSL / 2000',       caption: 'The waiting started to disappear.' },
      { value: '1', unit: 'Gbps', era: 'FIBRE / 2010',       caption: 'The internet became part of the day.' },
      { value: '5G', unit: '', era: 'MOBILE BROADBAND / 2020',       caption: 'The connection followed people outside.' }
    ];
    milestones.forEach(function (milestone, index) {
      window.setTimeout(function () {
        speedValue.textContent = milestone.value;
        speedUnit.textContent = milestone.unit;
        speedEra.textContent = milestone.era;
        speedCaption.textContent = milestone.caption;
      }, index * 650);
    });
    window.setTimeout(function () {
      sendSignal.hidden = true;
    }, 2200);
  });

  pillarTabs.forEach(function (tab) {
    tab.addEventListener('click', function () {
      var pillarData = {
        households: ['97.2%', 'homes connected', 'The connection moved from a room into everyday life.'],
        education: ['95%', 'schools connected', 'The classroom assumes the signal is already there.'],
        business: ['78%', 'businesses online', 'The storefront stays open after the shutters come down.'],
        government: ['90%', 'services online', 'The queue moves from the counter to the screen.']
      }[tab.dataset.pillar];
      pillarTabs.forEach(function (item) { item.classList.remove('is-active'); });
      tab.classList.add('is-active');
      pillarValue.textContent = pillarData[0];
      pillarLabel.textContent = pillarData[1];
      pillarCaption.textContent = pillarData[2];
    });
  });

  indexBars.forEach(function (bar) {
    bar.addEventListener('click', function () {
      indexBars.forEach(function (item) { item.classList.remove('is-active'); });
      bar.classList.add('is-active');
      indexResponse.textContent = {
        home: 'The network is no longer a special destination.',
        schools: 'The classroom now assumes the signal is already there.',
        businesses: 'The storefront can stay open after the shutters come down.',
        government: 'The queue moves from the counter to the screen.'
      }[bar.dataset.index];
    });
  });

  if ('IntersectionObserver' in window) {
    var broadbandObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        broadbandSteps.forEach(function (step) { step.classList.remove('is-active'); });
        entry.target.classList.add('is-active');
        var stageNumber = Array.prototype.indexOf.call(broadbandSteps, entry.target) + 1;
        broadbandProgress.textContent = String(stageNumber).padStart(2, '0') + ' / 03 — ' + entry.target.dataset.broadbandStep.toUpperCase();
      });
    }, { threshold: .6 });
    broadbandSteps.forEach(function (step) { broadbandObserver.observe(step); });
  }

  continueChapter4.addEventListener('click', function () {
    chapter4.hidden = false;
    chapter4.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });

  webCards.forEach(function (card) {
    card.addEventListener('click', function () {
      card.classList.add('is-open');
      chapter4.dataset.webFocus = card.dataset.web;
      var opened = document.querySelectorAll('.web-card.is-open').length;
      webCount.textContent = opened + ' / 3 opened';
      webStatus.textContent = opened === 3 ? 'The phone now travels with you. Continue to Chapter 5.' : opened + ' moment opened.';
      if (opened === 3) continueChapter5.hidden = false;
    });
  });

  if ('IntersectionObserver' in window) {
    var pocketObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        pocketSteps.forEach(function (step) { step.classList.remove('is-active'); });
        entry.target.classList.add('is-active');
        var pocketStep = entry.target.dataset.pocketStep;
        var pocketState = {
          '3g': { year: '2005', label: 'THE PHONE GOES WITH YOU', progress: '.15', story: 'The phone was no longer only for calls. Slowly, it became a small window to the world you carried through Singapore.' },
          '4g': { year: '2010', label: 'THE PHONE BECOMES USEFUL', progress: '.55', story: 'The internet started helping with ordinary decisions: which bus to take, where to go, and when to leave.' },
          always: { year: '2015', label: 'THE PHONE KEEPS YOU CONNECTED', progress: '.95', story: 'Music, video, work, and friends travelled with you. The internet had left the house.' }
        }[pocketStep];
        pocketYear.textContent = pocketState.year;
        pocketSpeed.textContent = pocketState.label;
        pocketTickerProgress.style.transform = 'scaleX(' + pocketState.progress + ')';
        pocketStory.textContent = pocketState.story;
      });
    }, { threshold: .6 });
    pocketSteps.forEach(function (step) { pocketObserver.observe(step); });
  }

  continueChapter5.addEventListener('click', function () {
    chapter5.hidden = false;
    chapter5.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });

  var alwaysStories = {
    home: {
      title: 'From waiting for a page to living inside the connection.',
      copy: 'In 1994, getting online was an event. Today, the remarkable thing is how ordinary it feels.'
    },
    street: {
      title: 'The connection comes with us.',
      copy: 'We use it to find a route, meet someone, pay for something, or check what is happening next.'
    },
    city: {
      title: 'The invisible thing became essential.',
      copy: 'The network is hidden in the walls and in the air, but our days quietly depend on it.'
    }
  };

  alwaysCards.forEach(function (card) {
    card.addEventListener('click', function () {
      var story = alwaysStories[card.dataset.always];
      alwaysCards.forEach(function (item) { item.classList.remove('is-active'); });
      card.classList.add('is-active');
      chapter5.dataset.alwaysFocus = card.dataset.always;
      alwaysTitle.textContent = story.title;
      alwaysCopy.textContent = story.copy;
    });
  });

  applyEraVisual(selectedEra);

  soundToggle.addEventListener('click', function () {
    soundOn = !soundOn;
    soundToggle.setAttribute('aria-pressed', String(soundOn));
    soundToggle.textContent = soundOn ? 'Sound: on' : 'Sound: off';
    if (soundOn) playTone(220, 0.12);
  });

  scene.addEventListener('error', function () {
    statusText.textContent = 'Image source unavailable';
    telemetryNote.textContent = 'The simulation still works, but the prototype image could not be loaded.';
  });

  renderConnectionWaits();

  if (window.scrollama) {
    var scroller = window.scrollama();
    scroller
      .setup({
        step: '.connection',
        offset: 0.62,
        progress: false
      })
      .onStepEnter(function (response) {
        var era = response.element.dataset.era;
        selectedEra = era;
        connectionButtons.forEach(function (button) {
          button.classList.toggle('is-scroll-active', button === response.element);
        });
        applyEraVisual(era);
        footerMessage.textContent = connections[era].label + ' selected by the story.';
      });
    window.addEventListener('resize', scroller.resize);
  }
})();
