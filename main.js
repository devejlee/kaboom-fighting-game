import kaboom from 'kaboom';

const k = kaboom({
  width: 1280,
  height: 720,
  scale: 0.7,
});

k.loadSprite('background', 'assets/background/background_layer_1.png');
k.loadSprite('trees', 'assets/background/background_layer_2.png');
k.loadSpriteAtlas('assets/oak_woods_tileset.png', {
  'ground-golden': {
    x: 16,
    y: 0,
    width: 16,
    height: 16,
  },
  'deep-ground': {
    x: 16,
    y: 32,
    width: 16,
    height: 16,
  },
  'ground-silver': {
    x: 150,
    y: 0,
    width: 16,
    height: 16,
  },
});

k.loadSprite('shop', 'assets/shop_anim.png', {
  sliceX: 6,
  sliceY: 1,
  anims: {
    default: {
      from: 0,
      to: 5,
      speed: 12,
      loop: true,
    },
  },
});

k.loadSprite('fence', 'assets/fence_1.png');
k.loadSprite('sign', 'assets/sign.png');

k.loadSprite('shop', 'assets/shop_anim.png', {
  sliceX: 6,
  sliceY: 1,
  anims: {
    default: {
      from: 0,
      to: 5,
      speed: 12,
      loop: true,
    },
  },
});

k.loadSprite('fence', 'assets/fence_1.png');
k.loadSprite('sign', 'assets/sign.png');

// plaer 1 sprites
k.loadSprite('idle-player1', 'assets/idle-player1.png', {
  sliceX: 8,
  sliceY: 1,
  anims: { idle: { from: 0, to: 7, speed: 12, loop: true } },
});
k.loadSprite('jump-player1', 'assets/jump-player1.png', {
  sliceX: 2,
  sliceY: 1,
  anims: { jump: { from: 0, to: 1, speed: 2, loop: true } },
});
k.loadSprite('attack-player1', 'assets/attack-player1.png', {
  sliceX: 6,
  sliceY: 1,
  anims: { attack: { from: 1, to: 5, speed: 18 } },
});
k.loadSprite('run-player1', 'assets/run-player1.png', {
  sliceX: 8,
  sliceY: 1,
  anims: { run: { from: 0, to: 7, speed: 18 } },
});
k.loadSprite('death-player1', 'assets/death-player1.png', {
  sliceX: 6,
  sliceY: 1,
  anims: { death: { from: 0, to: 5, speed: 10 } },
});

// player 2 sprites
loadSprite('idle-player2', 'assets/idle-player2.png', {
  sliceX: 4,
  sliceY: 1,
  anims: { idle: { from: 0, to: 3, speed: 8, loop: true } },
});
loadSprite('jump-player2', 'assets/jump-player2.png', {
  sliceX: 2,
  sliceY: 1,
  anims: { jump: { from: 0, to: 1, speed: 2, loop: true } },
});
loadSprite('attack-player2', 'assets/attack-player2.png', {
  sliceX: 4,
  sliceY: 1,
  anims: { attack: { from: 0, to: 3, speed: 18 } },
});
loadSprite('run-player2', 'assets/run-player2.png', {
  sliceX: 8,
  sliceY: 1,
  anims: { run: { from: 0, to: 7, speed: 18 } },
});
loadSprite('death-player2', 'assets/death-player2.png', {
  sliceX: 7,
  sliceY: 1,
  anims: { death: { from: 0, to: 6, speed: 10 } },
});

k.scene('fight', () => {
  const background = k.add([sprite('background'), scale(4)]);

  background.add([sprite('trees')]);

  const groundTiles = k.addLevel(
    [
      '',
      '',
      '',
      '',
      '',
      '',
      '',
      '',
      '',
      '------#######-----------',
      'dddddddddddddddddddddddd',
      'dddddddddddddddddddddddd',
    ],
    {
      tileWidth: 16,
      tileHeight: 16,
      tiles: {
        '#': () => [
          k.sprite('ground-golden'),
          k.area(),
          k.body({ isStatic: true }),
        ],
        '-': () => [
          k.sprite('ground-silver'),
          k.area(),
          k.body({ isStatic: true }),
        ],
        d: () => [
          k.sprite('deep-ground'),
          k.area(),
          k.body({ isStatic: true }),
        ],
      },
    }
  );

  groundTiles.use(k.scale(4));

  const shop = background.add([k.sprite('shop'), k.pos(170, 15)]);

  shop.play('default');

  // left invisible wall
  k.add([k.rect(16, 720), k.area(), k.body({ isStatic: true }), k.pos(-20, 0)]);

  // right invisible wall
  k.add([
    k.rect(16, 720),
    k.area(),
    k.body({ isStatic: true }),
    k.pos(1280, 0),
  ]);

  background.add([k.sprite('fence'), k.pos(85, 125)]);

  background.add([k.sprite('fence'), k.pos(10, 125)]);

  background.add([k.sprite('sign'), k.pos(290, 115)]);

  function makePlayer(posX, posY, width, height, scaleFactor, id) {
    return k.add([
      k.pos(posX, posY),
      k.scale(scaleFactor),
      k.area({ shape: new k.Rect(k.vec2(0), width, height) }),
      k.anchor('center'),
      k.body({ stickToPlatform: true }),
      {
        isCurrentlyJumping: false,
        health: 500,
        sprites: {
          run: 'run-' + id,
          idle: 'idle-' + id,
          jump: 'jump-' + id,
          attack: 'attack-' + id,
          death: 'death-' + id,
        },
      },
    ]);
  }

  k.setGravity(1200);

  // animations
  function run(player, speed, flipPlayer) {
    if (player.health === 0) {
      return;
    }

    if (player.curAnim() !== 'run' && !player.isCurrentlyJumping) {
      player.use(sprite(player.sprites.run));
      player.play('run');
    }
    player.move(speed, 0);
    player.flipX = flipPlayer;
  }

  function resetPlayerToIdle(player) {
    player.use(sprite(player.sprites.idle));
    player.play('idle');
  }

  function makeJump(player) {
    if (player.health === 0) {
      return;
    }

    if (player.isGrounded()) {
      const currentFlip = player.flipX;
      player.jump();
      player.use(sprite(player.sprites.jump));
      player.flipX = currentFlip;
      player.play('jump');
      player.isCurrentlyJumping = true;
    }
  }

  function resetAfterJump(player) {
    if (player.isGrounded() && player.isCurrentlyJumping) {
      player.isCurrentlyJumping = false;
      if (player.curAnim() !== 'idle') {
        resetPlayerToIdle(player);
      }
    }
  }

  function attack(player, excludedKeys) {
    if (player.health === 0) {
      return;
    }

    // only attack when not pressing anything
    for (const key of excludedKeys) {
      if (isKeyDown(key)) {
        return;
      }
    }

    const currentFlip = player.flipX;
    if (player.curAnim() !== 'attack') {
      player.use(sprite(player.sprites.attack));
      player.flipX = currentFlip;
      const slashX = player.pos.x + 30;
      const slashXFlipped = player.pos.x - 350;
      const slashY = player.pos.y - 200;

      k.add([
        k.rect(300, 300),
        k.area(),
        k.pos(currentFlip ? slashXFlipped : slashX, slashY),
        k.opacity(0),
        player.id + 'attackHitbox',
      ]);

      player.play('attack', {
        onEnd: () => {
          resetPlayerToIdle(player);
          player.flipX = currentFlip;
        },
      });
    }
  }

  // player 1 animations
  const player1 = makePlayer(200, 100, 16, 42, 4, 'player1');
  player1.use(sprite(player1.sprites.idle));
  player1.play('idle');

  k.onKeyDown('d', () => {
    run(player1, 500, false);
  });

  k.onKeyRelease('d', () => {
    if (player1.health !== 0) {
      resetPlayerToIdle(player1);
      player1.flipX = false;
    }
  });

  k.onKeyDown('a', () => {
    run(player1, -500, true);
  });

  k.onKeyRelease('a', () => {
    if (player1.health !== 0) {
      resetPlayerToIdle(player1);
      player1.flipX = true;
    }
  });

  k.onKeyDown('w', () => {
    makeJump(player1);
  });

  player1.onUpdate(() => {
    resetAfterJump(player1);
  });

  k.onKeyPress('space', () => {
    attack(player1, ['a', 'd', 'w']);
  });

  k.onKeyRelease('space', () => {
    k.destroyAll(player1.id + 'attackHitbox');
  });

  // player 2 animations
  const player2 = makePlayer(1000, 200, 16, 52, 4, 'player2');
  player2.use(sprite(player2.sprites.idle));
  player2.play('idle');
  player2.flipX = true;

  k.onKeyDown('right', () => {
    run(player2, 500, false);
  });
  k.onKeyRelease('right', () => {
    if (player2.health !== 0) {
      resetPlayerToIdle(player2);
      player2.flipX = false;
    }
  });

  k.onKeyDown('left', () => {
    run(player2, -500, true);
  });

  k.onKeyRelease('left', () => {
    if (player2.health !== 0) {
      resetPlayerToIdle(player2);
      player2.flipX = true;
    }
  });

  k.onKeyDown('up', () => {
    makeJump(player2);
  });

  player2.onUpdate(() => resetAfterJump(player2));

  k.onKeyPress('down', () => {
    attack(player2, ['left', 'right', 'up']);
  });

  k.onKeyRelease('down', () => {
    destroyAll(player2.id + 'attackHitbox');
  });

  // timer
  const counter = k.add([
    k.rect(100, 100),
    k.pos(center().x, center().y - 300),
    k.color(10, 10, 10),
    k.area(),
    k.anchor('center'),
  ]);

  const count = counter.add([
    k.text('60'),
    k.area(),
    k.anchor('center'),
    {
      timeLeft: 60,
    },
  ]);

  const winningText = k.add([
    k.text(''),
    k.area(),
    k.anchor('center'),
    k.pos(k.center()),
  ]);

  let gameOver = false;
  k.onKeyDown('enter', () => (gameOver ? go('fight') : null));

  function declareWinner(winningText, player1, player2) {
    if (
      (player1.health > 0 && player2.health > 0) ||
      (player1.health === 0 && player2.health === 0)
    ) {
      winningText.text = 'Tie!';
    } else if (player1.health > 0 && player2.health === 0) {
      winningText.text = 'Player 1 won!';
      player2.use(sprite(player2.sprites.death));
      player2.play('death');
    } else {
      winningText.text = 'Player 2 won!';
      player1.use(sprite(player1.sprites.death));
      player1.play('death');
    }
  }

  const countInterval = setInterval(() => {
    if (count.timeLeft === 0) {
      clearInterval(countInterval);
      declareWinner(winningText, player1, player2);
      gameOver = true;

      return;
    }
    count.timeLeft--;
    count.text = count.timeLeft;
  }, 1000);

  // player1 health
  const player1HealthContainer = k.add([
    k.rect(500, 70),
    k.area(),
    k.outline(5),
    k.pos(90, 20),
    k.color(200, 0, 0),
  ]);

  const player1HealthBar = player1HealthContainer.add([
    k.rect(498, 65),
    k.color(0, 180, 0),
    k.pos(498, 70 - 2.5),
    k.rotate(180),
  ]);

  player1.onCollide(player2.id + 'attackHitbox', () => {
    if (gameOver) {
      return;
    }

    if (player1.health !== 0) {
      player1.health -= 50;
      k.tween(
        player1HealthBar.width,
        player1.health,
        1,
        (val) => {
          player1HealthBar.width = val;
        },
        easings.easeOutSine
      );
    }

    if (player1.health === 0) {
      clearInterval(countInterval);
      declareWinner(winningText, player1, player2);
      gameOver = true;
    }
  });

  // player 2 health
  const player2HealthContainer = k.add([
    k.rect(500, 70),
    k.area(),
    k.outline(5),
    k.pos(690, 20),
    k.color(200, 0, 0),
  ]);

  const player2HealthBar = player2HealthContainer.add([
    k.rect(498, 65),
    k.color(0, 180, 0),
    k.pos(2.5, 2.5),
  ]);

  player2.onCollide(player1.id + 'attackHitbox', () => {
    if (gameOver) {
      return;
    }

    if (player2.health !== 0) {
      player2.health -= 50;
      k.tween(
        player2HealthBar.width,
        player2.health,
        1,
        (val) => {
          player2HealthBar.width = val;
        },
        easings.easeOutSine
      );
    }

    if (player2.health === 0) {
      clearInterval(countInterval);
      declareWinner(winningText, player1, player2);
      gameOver = true;
    }
  });
});

k.go('fight');
