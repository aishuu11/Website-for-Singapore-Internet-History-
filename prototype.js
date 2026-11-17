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
  var followCable = document.getElementById('followCable');
  var cableJourney = document.getElementById('cableJourney');
  var exitRoom = document.getElementById('exitRoom');
  var nextObject = document.getElementById('nextObject');
  var continueChapter3 = document.getElementById('continueChapter3');
  var chapter3 = document.getElementById('chapter3');
  var sendSignal = document.getElementById('sendSignal');
  var networkStatus = document.getElementById('networkStatus');
  var continueChapter4 = document.getElementById('continueChapter4');
  var chapter4 = document.getElementById('chapter4');
  var webCards = document.querySelectorAll('.web-card');
  var webCount = document.getElementById('webCount');
  var webStatus = document.getElementById('webStatus');
  var continueChapter5 = document.getElementById('continueChapter5');
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
    loadedReadout.textContent = Math.round(imageSizeKb * progress) + ' KB / 64 KB';
    timeReadout.textContent = progress >= 1 ? 'complete' : formatTime(remaining);
    heroTime.textContent = progress >= 1 ? '0.0' : Math.max(remaining, 0).toFixed(1);
    statusText.textContent = progress >= 1 ? 'Image received' : 'Receiving image via ' + connection.label;
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
    revealMessage.textContent = 'You waited ' + formatResultTime(totalSeconds) + ' for one picture.';
    testedEras[selectedEra] = totalSeconds;
    renderComparison();
    if (storyPart.hidden) {
      storyPart.hidden = false;
      window.requestAnimationFrame(function () {
        storyPart.classList.add('is-visible');
      });
    }
    if (Object.keys(testedEras).length === Object.keys(connections).length) {
      nextPrompt.classList.add('is-visible');
      footerMessage.textContent = 'All connections tested.';
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
    requestButton.innerHTML = 'Request again <span aria-hidden="true">↗</span>';
    speedReadout.textContent = connection.display;
    timeReadout.textContent = formatTime(totalSeconds);
    heroTime.textContent = totalSeconds.toFixed(1);
    loadedReadout.textContent = '0 KB / 64 KB';
    telemetryNote.textContent = '64 KB payload ÷ ' + connection.display + '. Theoretical maximum speed.';
    footerMessage.textContent = connection.label + ' selected — watch the image arrive.';
    revealMessage.textContent = '';
    nextPrompt.classList.remove('is-visible');
    scene.classList.remove('is-revealed');
    consoleStatus.innerHTML = '<span>&gt;</span> CONNECTING VIA ' + connection.label.toUpperCase() + '<span class="cursor" aria-hidden="true">_</span>';
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
        consoleStatus.innerHTML = '<span>&gt;</span> IMAGE RECEIVED';
        consoleStatus.classList.remove('is-active');
        finishLoading(connection, totalSeconds);
      }
    }
    animationFrame = window.requestAnimationFrame(tick);
  }

  document.getElementById('connectionGrid').addEventListener('click', function (event) {
    var button = event.target.closest('.connection');
    if (button && hasStarted) startLoading(button.dataset.era);
  });

  requestButton.addEventListener('click', function () {
    startLoading(selectedEra);
  });

  skipButton.addEventListener('click', function () {
    if (!hasStarted) startLoading(selectedEra);
    window.cancelAnimationFrame(animationFrame);
    var connection = connections[selectedEra];
    renderProgress(1, connection, 0);
    consoleStatus.innerHTML = '<span>&gt;</span> IMAGE RECEIVED';
    consoleStatus.classList.remove('is-active');
    finishLoading(connection, 0);
  });

  enterStory.addEventListener('click', function () {
    roomIntro.hidden = true;
    roomScene.hidden = false;
    roomScene.classList.add('room-awake');
    roomScene.dataset.frame = '0';
    startBillingMeter();
    firstConnection.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });

  roomObjects.forEach(function (object) {
    object.addEventListener('click', function () {
      var objectId = object.id;
      zoomToObject(object);
      roomScene.classList.add('is-focused');
      roomScene.dataset.focus = objectId;
      exploredObjects[objectId] = true;
      roomTracker.textContent = Object.keys(exploredObjects).length + ' of 3 explored';
      unlockCableJourney();
      roomObjects.forEach(function (item) { item.classList.remove('is-inspected'); });
      object.classList.add('is-inspected');
      if (objectId === 'telephoneObject') {
        setRoomFrame(1);
        roomKicker.textContent = 'TELEPHONE LINE / OCCUPIED';
        roomStoryTitle.textContent = 'The line is yours.';
        roomStoryCopy.textContent = '“Get off the computer, I need to use the phone!” The line is occupied by the internet, so an incoming call cuts the connection. In 1994, going online had a social cost.';
        roomProgress.style.transform = 'scaleX(.28)';
        roomScene.classList.add('phone-occupied', 'phone-ringing', 'connection-cut');
        computerStatus.textContent = 'LINE INTERRUPTED';
        startBillingMeter();
        return;
      }
      if (objectId === 'modemObject') {
        setRoomFrame(2);
        roomKicker.textContent = 'MODEM / LISTENING';
        roomStoryTitle.textContent = 'Now let the modem sing.';
        roomStoryCopy.textContent = 'The modem turns a telephone line into a data line. Its screech is a handshake: two machines negotiating how to speak at 56 kbps.';
        roomProgress.style.transform = 'scaleX(.62)';
        roomScene.classList.add('modem-active');
        roomScene.classList.remove('phone-ringing', 'connection-cut');
        computerStatus.textContent = 'OFFLINE';
        playTone(260, .2);
        window.setTimeout(function () { playTone(440, .24); }, 220);
        return;
      }
      setRoomFrame(3);
      roomKicker.textContent = 'FIRST PAGE / ARRIVING';
      roomStoryTitle.textContent = 'The page is finally here.';
      roomStoryCopy.textContent = 'The page does not appear all at once. It arrives in strips, slowly enough to watch a distant server become visible on a Singapore screen.';
      roomProgress.style.transform = 'scaleX(1)';
      computerStatus.textContent = 'CONNECTED / 56 KBPS';
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
    var objectIds = ['telephoneObject', 'modemObject', 'computerObject'];
    var currentIndex = objectIds.indexOf(roomScene.dataset.focus);
    var nextIndex = currentIndex < 0 ? 0 : (currentIndex + 1) % objectIds.length;
    document.getElementById(objectIds[nextIndex]).click();
  });

  meterObject.addEventListener('click', function () {
    meterObject.classList.toggle('is-inspected');
    startBillingMeter();
    roomKicker.textContent = 'SINGNET / METER RUNNING';
    roomStoryTitle.textContent = 'Every minute costs.';
    roomStoryCopy.textContent = 'The longer the page takes, the more the household watches the bill climb. In this room, “just five more minutes” is not free.';
    roomProgress.style.transform = 'scaleX(.46)';
  });

  followCable.addEventListener('click', function () {
    cableJourney.hidden = false;
    roomScene.classList.add('cable-mode');
    cableJourney.classList.add('is-travelling');
    roomTracker.textContent = '3 of 3 explored / signal followed';
    continueChapter3.hidden = false;
  });

  continueChapter3.addEventListener('click', function () {
    chapter3.hidden = false;
    chapter3.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });

  sendSignal.addEventListener('click', function () {
    var nodes = document.querySelectorAll('.network-node');
    sendSignal.disabled = true;
    document.getElementById('networkMap').classList.add('is-live');
    networkStatus.textContent = 'Signal travelling from the home to the exchange...';
    nodes[0].classList.add('is-reached');
    window.setTimeout(function () {
      nodes[1].classList.add('is-reached');
      networkStatus.textContent = 'The exchange routes it onto the national backbone...';
    }, 850);
    window.setTimeout(function () {
      nodes[2].classList.add('is-reached');
      networkStatus.textContent = 'One small room is now part of the world.';
    }, 1700);
    window.setTimeout(function () {
      nodes[3].classList.add('is-reached');
      continueChapter4.hidden = false;
      sendSignal.hidden = true;
      networkStatus.textContent = 'Signal delivered. The audience is waiting.';
    }, 2700);
  });

  continueChapter4.addEventListener('click', function () {
    chapter4.hidden = false;
    chapter4.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });

  webCards.forEach(function (card) {
    card.addEventListener('click', function () {
      card.classList.add('is-open');
      chapter4.dataset.webFocus = card.dataset.web;
      var opened = document.querySelectorAll('.web-card.is-open').length;
      webCount.textContent = opened + ' / 4';
      webStatus.textContent = opened === 4 ? 'The web is no longer empty. Continue to Chapter 5.' : opened + ' destination' + (opened === 1 ? '' : 's') + ' opened.';
      if (opened === 4) continueChapter5.hidden = false;
    });
  });

  continueChapter5.addEventListener('click', function () {
    chapter5.hidden = false;
    chapter5.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });

  var alwaysStories = {
    home: {
      title: 'From one phone line to a city that never disconnects.',
      copy: 'The miracle is no longer that a page arrives. It is that we notice when it does not.'
    },
    street: {
      title: 'The connection learned to move.',
      copy: 'What began beside a telephone became something carried in a pocket, through a neighbourhood and across the island.'
    },
    city: {
      title: 'The network became part of the landscape.',
      copy: 'The cables, exchanges and signals are mostly invisible now. Their presence is felt in everything that depends on being online.'
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

  connectionButtons.forEach(function (button) {
    button.disabled = true;
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
