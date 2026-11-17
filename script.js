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
  var photoFrame = document.querySelector('.photo-frame');
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
  var enterHomeButton = document.getElementById('enterHomeButton');
  var doorwayTrigger = document.getElementById('doorwayTrigger');
  var roomIntro = document.querySelector('.room-intro');
  var firstConnection = document.getElementById('firstConnection');
  var roomScene = document.querySelector('.room-scene');
  var roomPrompt = document.querySelector('.room-prompt');
  var roomPromptTyped = document.getElementById('roomPromptTyped');
  var roomPromptAccessible = document.querySelector('.room-prompt-accessible');
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
  var backToRoomFromCable = document.getElementById('backToRoomFromCable');
  var connectionScroll = document.getElementById('connectionScroll');
  var connectionVisual = document.getElementById('connectionVisual');
  var connectionStageIndex = document.getElementById('connectionStageIndex');
  var connectionStageLabel = document.getElementById('connectionStageLabel');
  var connectionSteps = document.querySelectorAll('.connection-step');
  var exitRoom = document.getElementById('exitRoom');
  var nextObject = document.getElementById('nextObject');
  var backToRoom = document.getElementById('backToRoom');
  var continueChapter3 = document.getElementById('continueChapter3');
  var chapter3 = document.getElementById('chapter3');
  var chapter4 = document.getElementById('chapter4');
  var pocketSteps = document.querySelectorAll('.pocket-stop');
  var pocketVisual = document.getElementById('pocketVisual');
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
  var hasLoaded = false;
  var testedEras = {};
  var exploredObjects = {};
  var billingInterval;
  var billingMinutes = 0;
  var billingRate = 0.05;
  var roomPromptTimer;

  var connectionStageDetails = {
    home: { index: '01 / 03', label: 'From the home' },
    local: { index: '02 / 03', label: 'Singapore’s local network' },
    international: { index: '03 / 03', label: 'International undersea cable' }
  };
  var connectionScrollFrame;

  function setConnectionStage(step) {
    var stage = step.dataset.connectionStep;
    var details = connectionStageDetails[stage];

    connectionSteps.forEach(function (item) {
      item.classList.toggle('is-active', item === step);
    });
    connectionVisual.dataset.stage = stage;
    connectionStageIndex.textContent = details.index;
    connectionStageLabel.textContent = details.label;
    if (stage === 'international') continueChapter3.hidden = false;
  }

  function updateConnectionStage() {
    var scrollBounds = connectionScroll.getBoundingClientRect();
    var centerY = scrollBounds.top + scrollBounds.height / 2;
    var nearestStep;
    var nearestDistance = Infinity;

    connectionSteps.forEach(function (step) {
      var bounds = step.getBoundingClientRect();
      var isVisible = bounds.bottom > scrollBounds.top && bounds.top < scrollBounds.bottom;
      var distance = Math.abs((bounds.top + bounds.bottom) / 2 - centerY);

      if (isVisible && distance < nearestDistance) {
        nearestStep = step;
        nearestDistance = distance;
      }
    });

    if (nearestStep) setConnectionStage(nearestStep);
  }

  function scheduleConnectionStageUpdate() {
    if (connectionScrollFrame) window.cancelAnimationFrame(connectionScrollFrame);
    connectionScrollFrame = window.requestAnimationFrame(updateConnectionStage);
  }

  connectionSteps.forEach(function (step) {
    step.addEventListener('focus', function () {
      setConnectionStage(step);
    });
  });
  connectionScroll.addEventListener('scroll', scheduleConnectionStageUpdate, { passive: true });
  window.addEventListener('resize', scheduleConnectionStageUpdate);

  function closeRoomFocus() {
    roomScene.classList.remove('is-focused');
    roomScene.removeAttribute('data-focus');
    roomObjects.forEach(function (item) { item.classList.remove('is-inspected'); });
    meterObject.classList.remove('is-inspected');
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
      meterMinutes.textContent = String(Math.floor(billingMinutes / 60)).padStart(2, '0') + ':' + String(billingMinutes % 60).padStart(2, '0') + ' simulated';
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

  function showUserGrowth() {
    userGrowth.hidden = false;
    userCount.textContent = '≈100,000';
    roomStoryCopy.textContent = 'By mid-1996, SingNet had around 100,000 users. The connection was no longer a curiosity in one room.';
    houseIcons.innerHTML = '';
    for (var i = 0; i < 32; i += 1) {
      var house = document.createElement('i');
      house.classList.add('is-lit');
      houseIcons.appendChild(house);
    }
    nextChapter.hidden = false;
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

  function selectConnection(era) {
    selectedEra = era;
    connectionButtons.forEach(function (button) {
      var isSelected = button.dataset.era === era;
      button.classList.toggle('is-selected', isSelected);
      button.setAttribute('aria-pressed', String(isSelected));
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
    hasLoaded = true;
    requestButton.disabled = false;
    requestButton.innerHTML = 'Show me the photo <span aria-hidden="true">↗</span>';
    skipButton.hidden = true;
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
    selectConnection(era);
    hasStarted = true;
    hasLoaded = false;
    applyEraVisual(era);
    experience.classList.add('is-transmitting');
    experience.classList.remove('show-controls');
    window.cancelAnimationFrame(animationFrame);
    connectionButtons.forEach(function (button) {
      button.disabled = false;
      button.style.setProperty('--fill', '0%');
    });

    var totalSeconds = (imageSizeKb * 8) / connection.speedKbps;
    requestButton.disabled = true;
    requestButton.textContent = 'The photo is arriving…';
    skipButton.hidden = false;
    speedReadout.textContent = connection.label + ' connection';
    timeReadout.textContent = formatTime(totalSeconds);
    heroTime.textContent = totalSeconds.toFixed(1);
    loadedReadout.textContent = 'Not yet';
    telemetryNote.textContent = 'Watch one photograph arrive using the ' + connection.label + ' connection.';
    footerMessage.textContent = 'Photo arriving with ' + connection.label + '.';
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
    if (hasLoaded) {
      photoFrame.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }
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
    enterRoom();
  });

  function typeRoomPrompt() {
    var fullPrompt = roomPromptAccessible.textContent.trim();
    var position = 0;
    var prefersReducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    window.clearTimeout(roomPromptTimer);
    roomPrompt.classList.remove('is-typing');
    if (prefersReducedMotion) {
      roomPromptTyped.textContent = fullPrompt;
      return;
    }

    roomPromptTyped.textContent = '';
    roomPrompt.classList.add('is-typing');
    function typeNextCharacter() {
      position += 1;
      roomPromptTyped.textContent = fullPrompt.slice(0, position);
      if (position === fullPrompt.length) {
        roomPrompt.classList.remove('is-typing');
        return;
      }
      roomPromptTimer = window.setTimeout(typeNextCharacter, 30);
    }
    roomPromptTimer = window.setTimeout(typeNextCharacter, 250);
  }

  function enterRoom() {
    roomIntro.hidden = true;
    roomScene.hidden = false;
    roomScene.classList.add('room-awake');
    roomScene.dataset.frame = '0';
    typeRoomPrompt();
    startBillingMeter();
    firstConnection.scrollIntoView({ behavior: 'auto', block: 'start' });
  }

  doorwayTrigger.addEventListener('click', function () {
    enterRoom();
  });

  roomObjects.forEach(function (object) {
    object.addEventListener('click', function () {
      var objectId = object.id;
      roomScene.classList.add('is-focused');
      roomScene.dataset.focus = objectId;
      exploredObjects[objectId] = true;
      roomTracker.textContent = Object.keys(exploredObjects).length + ' of 3 explored';
      roomTrackerTop.textContent = Object.keys(exploredObjects).length + ' OF 3 OBJECTS EXPLORED';
      unlockCableJourney();
      nextObject.textContent = 'NEXT OBJECT →';
      nextObject.classList.remove('is-final');
      roomObjects.forEach(function (item) { item.classList.remove('is-inspected'); });
      meterObject.classList.remove('is-inspected');
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
      showUserGrowth();
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
    roomScene.classList.add('is-focused');
    roomScene.dataset.focus = 'meterObject';
    roomObjects.forEach(function (item) { item.classList.remove('is-inspected'); });
    meterObject.classList.add('is-inspected');
    startBillingMeter();
    roomKicker.textContent = 'SINGNET: METER RUNNING';
    roomStoryTitle.textContent = 'Every minute on the clock cost money.';
    roomStoryCopy.textContent = 'Early SingNet plans charged by the minute on top of phone call rates. The moving counter is a simulation, not a documented SingNet tariff.';
    roomProgress.style.transform = 'scaleX(.46)';
  });

  followCable.addEventListener('click', function () {
    cableJourney.hidden = false;
    storyPart.classList.add('cable-open');
    roomScene.classList.add('cable-mode');
    roomTracker.textContent = '3 of 3 explored: signal followed';
    continueChapter3.hidden = true;
    connectionScroll.scrollTop = 0;
    connectionVisual.dataset.stage = 'home';
    connectionStageIndex.textContent = connectionStageDetails.home.index;
    connectionStageLabel.textContent = connectionStageDetails.home.label;
    connectionSteps.forEach(function (step, index) {
      step.classList.toggle('is-active', index === 0);
    });
    connectionScroll.focus({ preventScroll: true });
    scheduleConnectionStageUpdate();
  });

  function closeCableJourney() {
    roomScene.classList.remove('cable-mode');
    storyPart.classList.remove('cable-open');
    cableJourney.hidden = true;
    followCable.focus();
  }

  backToRoomFromCable.addEventListener('click', closeCableJourney);
  cableJourney.addEventListener('keydown', function (event) {
    if (event.key === 'Escape') {
      event.preventDefault();
      closeCableJourney();
    }
  });

  continueChapter3.addEventListener('click', function () {
    roomScene.classList.remove('cable-mode');
    storyPart.classList.remove('cable-open');
    cableJourney.hidden = true;
    closeRoomFocus();
    roomScene.hidden = true;
    roomIntro.hidden = false;
    chapter3.hidden = false;
    chapter3.scrollIntoView({ behavior: 'smooth', block: 'start' });
    chapter3.setAttribute('tabindex', '-1');
    chapter3.focus({ preventScroll: true });
  });

  var pocketStates = {
    news: { stop: 'STOP 01 / NEWS · 2005', prompt: 'NEXT STOP: FIND THE BUS ↓' },
    bus: { stop: 'STOP 02 / GETTING AROUND · 2010', prompt: 'NEXT STOP: THE TRAIN ↓' },
    train: { stop: 'STOP 03 / 4G ON THE MOVE · 2015', prompt: 'THE JOURNEY CONTINUES ↓' }
  };

  function updatePocketVisualReferences(element, idMap) {
    ['aria-labelledby', 'aria-describedby'].forEach(function (attribute) {
      var value = element.getAttribute(attribute);
      if (!value) return;
      element.setAttribute(attribute, value.split(/\s+/).map(function (id) {
        return idMap[id] || id;
      }).join(' '));
    });
  }

  if (pocketVisual) {
    pocketSteps.forEach(function (step, index) {
      var stop = step.dataset.pocketStep;
      var stage = index === 0 ? pocketVisual : pocketVisual.cloneNode(true);
      if (index > 0) {
        var idMap = {};
        stage.id = 'pocketVisual-' + stop;
        stage.querySelectorAll('[id]').forEach(function (element) {
          var originalId = element.id;
          idMap[originalId] = originalId + '-' + stop;
          element.id = idMap[originalId];
        });
        updatePocketVisualReferences(stage, idMap);
        stage.querySelectorAll('[aria-labelledby], [aria-describedby]').forEach(function (element) {
          updatePocketVisualReferences(element, idMap);
        });
      }

      var state = pocketStates[stop];
      stage.dataset.stop = stop;
      stage.querySelector('#' + (index === 0 ? 'pocketStageStop' : 'pocketStageStop-' + stop)).textContent = state.stop;
      stage.querySelector('#' + (index === 0 ? 'pocketStagePrompt' : 'pocketStagePrompt-' + stop)).textContent = state.prompt;
      step.insertBefore(stage, step.firstChild);
    });
  }

  function activatePocketStep(step) {
    if (!step) return;
    var stop = step.dataset.pocketStep;
    if (!pocketStates[stop]) return;

    pocketSteps.forEach(function (item) {
      item.classList.toggle('is-active', item === step);
    });
  }

  pocketSteps.forEach(function (step) {
    step.addEventListener('focusin', function () {
      activatePocketStep(step);
    });
  });

  var pocketScrollFrame;

  function updatePocketFromScroll() {
    pocketScrollFrame = 0;
    if (chapter4.hidden) return;
    var sectionBounds = chapter4.getBoundingClientRect();
    if (sectionBounds.bottom < 0 || sectionBounds.top > window.innerHeight) return;

    var focusY = window.innerHeight * (window.innerWidth <= 900 ? .6 : .35);
    var closestStep;
    var closestDistance = Infinity;
    pocketSteps.forEach(function (step) {
      var bounds = step.getBoundingClientRect();
      var distance = focusY < bounds.top ? bounds.top - focusY : focusY > bounds.bottom ? focusY - bounds.bottom : 0;
      if (distance < closestDistance) {
        closestDistance = distance;
        closestStep = step;
      }
    });
    if (closestStep) activatePocketStep(closestStep);
  }

  function schedulePocketUpdate() {
    if (pocketScrollFrame) return;
    pocketScrollFrame = window.requestAnimationFrame(updatePocketFromScroll);
  }

  window.addEventListener('scroll', schedulePocketUpdate, { passive: true });
  window.addEventListener('resize', schedulePocketUpdate);

  applyEraVisual(selectedEra);

  soundToggle.addEventListener('click', function () {
    soundOn = !soundOn;
    soundToggle.setAttribute('aria-pressed', String(soundOn));
    soundToggle.textContent = soundOn ? 'Sound: on' : 'Sound: off';
    if (soundOn) playTone(220, 0.12);
  });

  scene.addEventListener('error', function () {
    statusText.textContent = 'Image source unavailable';
    telemetryNote.textContent = 'The simulation still works, but the story image could not be loaded.';
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
        connectionButtons.forEach(function (button) {
          button.classList.toggle('is-scroll-active', button === response.element);
        });
        if (!hasStarted) {
          selectConnection(era);
          applyEraVisual(era);
          footerMessage.textContent = connections[era].label + ' selected by the story.';
        }
      });
    window.addEventListener('resize', scroller.resize);
  }

  selectConnection(selectedEra);
})();
