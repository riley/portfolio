var Zodiac = (function() {

    'use strict';

    var _width = window.innerWidth - 200;
    var _height = window.innerHeight;

    var stars;

    var camera, scene, renderer, group;
    var controls; // the trackball controls
    var mouseX = 0, mouseY = 0;

    var sun, earthToSunLine = {};

    // particles
    var TAU = Math.PI * 2;

    function range(num) {
        return Array.apply(null, Array(num)).map(function (_, i) {return i;});
    }

    var spectralMap = {
        'O': {
            path: 'blue.png',
            color: 0x9aafff
        },
        'B': {
            path: 'blueWhite.png',
            color: 0xcad7ff
        },
        'A': {
            path: 'white.png',
            color: 0xf8f7ff
        },
        'F': {
            path: 'yellowWhite.png',
            color: 0xfcffd3
        },
        'G': {
            path: 'yellow.png',
            color: 0xfff2a1
        },
        'K': {
            path: 'orange.png',
            color: 0xfff2a1
        },
        'M': {
            path: 'red.png',
            color: 0xff6151
        }
    };

    Object.keys(spectralMap).forEach(function (spectralClass) {
        spectralMap[spectralClass].material = new THREE.ParticleBasicMaterial({
            color: spectralMap[spectralClass].color,
            map: THREE.ImageUtils.loadTexture('images/' + spectralMap[spectralClass].path),
            blending: THREE.AdditiveBlending,
            transparent: true
        });
    });

    function getStarColor(spectralClass) {
        var sClass = spectralClass.substring(0, 1);
        if ( typeof spectralMap[sClass] === 'undefined' ) { return spectralMap.M.material; }
        return spectralMap[sClass].material;
    }

    function toCartesian ( rightAscension, declination ) {

        var raCoord = rightAscension.split(' ');
        var raHours = parseInt(raCoord[0], 10);
        var raMinutes = parseInt(raCoord[1], 10) / 60;
        var raSeconds = parseFloat(raCoord[2], 10) / 3600;

        //var theta = ( ( raHours + raMinutes + raSeconds) * 15 ) * ( Math.PI / 180 ); // into radians.
        var theta = ( raHours + raMinutes + raSeconds ) * ( Math.PI / 12 );

        var decCoord = declination.split(' ');
        var decDegrees = parseInt(decCoord[0], 10);
        var decMinutes = parseInt(decCoord[1], 10) / 60;
        var decSeconds = parseFloat(decCoord[2], 10) / 3600;

        var phi = ( decDegrees + decMinutes + decSeconds ) * ( Math.PI / 180 ); // into radians.

        return new THREE.Vector3(
            Math.cos(phi) * Math.sin(theta),
            Math.sin(phi),
            Math.cos(phi) * Math.cos(theta)
        ).normalize();
    }
    var easing = 0.1;

    return {
        camera: camera,
        mouseX: mouseX,
        mouseY: mouseY,
        windowHalfX: _width / 2,
        windowHalfY: _height / 2,
        stars: stars,
        sun: function() { return sun; },
        earthToSunLine: function() { return earthToSunLine; },

        init: function() {

            var container, particle;

            container = document.createElement('div');
            document.body.appendChild(container);

            camera = new THREE.Camera( 75, _width / _height, 1, 10000 );
            this.camera = camera;
            camera.position.z = 200;
            camera.position.y = 50;
            // rotate camera with camera.up vector
            //camera.up.y = 0.5;
            //camera.up.x = 0.5;

            scene = new THREE.Scene();
            group = new THREE.Object3D();
            scene.add( group );

            renderer = new THREE.WebGLRenderer();
            renderer.setPixelRatio(window.devicePixelRatio);
            renderer.setSize(_width, _height);
            container.appendChild(renderer.domElement);

            var m3 = new THREE.ParticleBasicMaterial({
                //color: 0x0000ff,
                map: THREE.ImageUtils.loadTexture( 'images/globe-green.png' ),
                blending: THREE.AdditiveBlending,
                transparent: true
            });

            // create constellations
            Object.keys(zodiac).forEach(function (sign) {
                var constellation = zodiac[sign];
                var geom = new THREE.Geometry();
                geom.vertices = constellation.shapePath.map(function (coord) {
                    var v3 = toCartesian(coord.ra, coord.dec);
                    v3.multiplyScalar(coord.dist);
                    return v3;
                });

                // lines between stars
                var line = new THREE.Line(geom, new THREE.LineBasicMaterial({color: 0x00ffff, opacity: 0.25}));
                group.add(line);

                var label = new THREE.Particle(
                    new THREE.ParticleBasicMaterial({
                        map: THREE.ImageUtils.loadTexture(constellation.imagePath),
                        blending: THREE.AdditiveBlending,
                        transparent: true
                    })
                );
                var firstPos = geom.vertices[0];
                label.position.set(firstPos.x, firstPos.y, firstPos.z);
                label.position.multiplyScalar(250);
                label.scale.x = label.scale.y = 0.3;
                group.add(label);
            });


            // constellation connecting lines
            // for (var m = 0; m < zodiac.length; m++) {
            //     var z = {};
            //     z.path = zodiac[m].shapePath.slice(0);
            //     z.geometry = new THREE.Geometry();
            //     for (var k = 0; k < z.path.length; k++) {
            //         var p = toCartesian(z.path[k].ra, z.path[k].dec);
            //         var v3 = new THREE.Vector3( p[0], p[1], p[2] );
            //         v3.normalize();
            //         v3.multiplyScalar( z.path[k].dist );
            //         z.geometry.vertices.push( new THREE.Vertex( v3 ) );
            //     }
            //     z.line = new THREE.Line( z.geometry, new THREE.LineBasicMaterial({ color: 0x00ffff, opacity: 0.35 }));
            //     group.addChild(z.line);

            //     // add labels
            //     var label = new THREE.Particle(
            //         new THREE.ParticleBasicMaterial({
            //             map: THREE.ImageUtils.loadTexture( zodiac[m].imagePath ),
            //             blending: THREE.AdditiveBlending,
            //             transparent: true
            //         })
            //     );
            //     label.position.set.apply(label.position, p);
            //     label.position.multiplyScalar(250);
            //     label.scale.x = label.scale.y = 0.3;
            //     group.addChild(label);
            // }


            this.stars.forEach(function (star) {
                particle = new THREE.Particle( getStarColor(star.spec) );
                particle.position.set(star.x, star.y, star.z);
                particle.scale.x = particle.scale.y = 0.1; //Math.random() * 2.5 + 1.25;

                group.add( particle );
            });

            // local stars
            // for ( var i = 0; i < this.stars.length; i ++ ) {

            //     particle = new THREE.Particle( getStarColor(this.stars[i].spec) );
            //     particle.position.set(this.stars[i].x, this.stars[i].y, this.stars[i].z);
            //     particle.scale.x = particle.scale.y = 0.1; //Math.random() * 2.5 + 1.25;

            //     group.add( particle );
            // }

            // polaris
            var polaris = new THREE.Particle( m2 );

            polaris.copy(toCartesian( '02 31 49.09', '+89 15 50.8' ));
            polaris.position.multiplyScalar( 433 );
            polaris.scale.x = polaris.scale.y = 5;
            group.add( polaris );
            var pLabel = new THREE.Particle(
                new THREE.ParticleBasicMaterial({
                    map: THREE.ImageUtils.loadTexture( 'images/polaris.png' ),
                    blending: THREE.AdditiveBlending,
                    transparent: true
                })
            );
            pLabel.position = new THREE.Vector3(0.1, 1, 0.1);
            pLabel.position.multiplyScalar(500);
            pLabel.scale.x = pLabel.scale.y = 1;
            group.add(pLabel);

            var alphaCentauri = new THREE.Particle(
                new THREE.ParticleBasicMaterial({
                    map: THREE.ImageUtils.loadTexture( 'images/ac.png' ),
                    blending: THREE.AdditiveBlending,
                    transparent: true
                })
            );
            alphaCentauri.position.copy(toCartesian('14 39 36.4951', '-60 50 02.308'));
            alphaCentauri.position.multiplyScalar(4.3);
            alphaCentauri.scale.x = alphaCentauri.scale.y = 0.2;
            group.add(alphaCentauri);

            // the pale blue dot
            var paleBlueDot = new THREE.Particle( m3 );
            paleBlueDot.scale.x = paleBlueDot.scale.y = 0.25;
            group.add( paleBlueDot );

            // background celestial sphere
            var eq = new THREE.Geometry();
            for (var l = -0.75; l < 1; l += 0.25 ) {
                var lat = new THREE.Geometry();
                for ( var j = 0; j <= 30; j++ ) {
                    var theta = j / 15 * Math.PI;
                    var vector = new THREE.Vector3( Math.cos(theta), l, Math.sin(theta) );
                    vector.normalize();
                    vector.multiplyScalar( 4500 );
                    lat.vertices.push( new THREE.Vertex( vector ) );

                    if (l === 0) {  // close equator
                        var v = vector.clone();
                        v.multiplyScalar( 0.1 );
                        eq.vertices.push( new THREE.Vertex( v ) );
                    }

                }
                var latitude = new THREE.Line( lat, new THREE.LineBasicMaterial( { color: 0xff88ff, opacity: 0.25 } ) );
                var equator = new THREE.Line( eq, new THREE.LineBasicMaterial( { color: 0x8888ff, opacity: 0.25 } ) );
                group.add( equator );
                group.add( latitude );
            }

            // ecliptic
            var ec = new THREE.Geometry();
            var phi = 23.44 * Math.PI/180; // axial tilt in radians
            for ( var theta = 0; theta <= 360; theta += 15 ) {
                var t = theta * Math.PI/180;
                var ec_x = Math.cos(phi) * Math.sin(t);
                var ec_y = Math.sin(phi) * Math.sin(t);
                var ec_z = Math.cos(t);
                var ec_v = new THREE.Vector3( ec_x, ec_y, ec_z );
                ec_v.normalize();
                ec_v.multiplyScalar( 450 );
                ec.vertices.push( new THREE.Vertex( ec_v ) );
            }

            var oneYear = 365 * 24 * 60 * 60 * 1000; // milliseconds
            var now = new Date();
            var epoch = new Date("March 20, 2012 5:14 am");
            var around = TAU * (((now - epoch) % oneYear) / oneYear);
            sun = new THREE.Particle( new THREE.ParticleCanvasMaterial( { color: 0xffff00, program: program } ) );
            sun.position.set(Math.cos(phi)*Math.sin(around), Math.sin(phi)*Math.sin(around), Math.cos(around));
            sun.scale.x = sun.scale.y = 100;
            sun.position.multiplyScalar(4000);
            group.add(sun);

            var earthToSun = new THREE.Geometry();
            earthToSun.vertices.push( new THREE.Vertex( new THREE.Vector3() ) );
            earthToSun.vertices.push( new THREE.Vertex( sun.position ) );
            earthToSunLine = new THREE.Line( earthToSun, new THREE.LineBasicMaterial( { color: 0xffff00, opactiy: .5 } ) );
            group.add(earthToSunLine);

            var ecliptic = new THREE.Line( ec, new THREE.LineBasicMaterial( { color: 0xffff00, opactiy: 0.5 } ) );
            group.add( ecliptic );

            // longitudes lines
            for (var y = 0; y < 360; y+=30) {
                var lon = new THREE.Geometry();
                for ( var j = 0; j <= 30; j++ ) {
                    var theta = j / 15 * Math.PI;
                    var phi = y * (Math.PI/180);
                    var vector = new THREE.Vector3(Math.cos(theta)*Math.sin(phi), Math.sin(theta), Math.cos(theta)*Math.cos(phi));
                    vector.normalize();
                    vector.multiplyScalar( 4500 );
                    lon.vertices.push( new THREE.Vertex( vector ) );
                }
                var longitude = new THREE.Line( lon, new THREE.LineBasicMaterial( { color: 0xff88ff, opacity: 0.25 }));
                group.add( longitude );
            }

            document.addEventListener('click', onDocumentClick, false );
            document.addEventListener('mousemove', onDocumentMouseMove, false );
            document.addEventListener('touchstart', onDocumentTouchStart, false );
            document.addEventListener('touchmove', onDocumentTouchMove, false );
        },

        animate: function() {
            requestAnimationFrame(Zodiac.animate);
            Zodiac.render();
        },

        render: function() {
            renderer.render( scene, camera );
        },
        initControls: function() {

            // TODO: replace all this with trackball controls

            // $('#lockCenter').click(function() {
            //     camera.position.z = 0;
            //     camera.position.x = 0;
            //     camera.position.y = 0;
            //     pushLock = true;
            //     console.log(Zodiac)
            //     Zodiac.earthToSunLine().visible = false;
            //     $('a').toggle();
            //     return false;
            // });

            // $('#releaseLock').click(function() {
            //     pushLock = false;
            //     group.rotation.x = 0;
            //     Zodiac.earthToSunLine().visible = true;
            //     $('a').toggle();
            //     return true;
            // });
        }
    }
    // part of requestAnimationFrame issue.

})();

    function onDocumentMouseMove(event) {

        Zodiac.mouseX = event.clientX - Zodiac.windowHalfX;
        Zodiac.mouseY = event.clientY - Zodiac.windowHalfY;
    }

    function onDocumentTouchStart( event ) {

        if ( event.touches.length > 1 ) {

            event.preventDefault();

            mouseX = event.touches[ 0 ].pageX - windowHalfX;
            mouseY = event.touches[ 0 ].pageY - windowHalfY;

        }

    }

    function onDocumentTouchMove( event ) {

        if ( event.touches.length == 1 ) {

            event.preventDefault();

            Zodiac.mouseX = event.touches[ 0 ].pageX - Zodiac.windowHalfX;
            Zodiac.mouseY = event.touches[ 0 ].pageY - Zodiac.windowHalfY;

        }

    }

    var xhr = new XMLHttpRequest();
    xhr.open('GET', 'data/stars.json');
    xhr.onload = function () {
        if (xhr.status === 200) {
            Zodiac.stars = JSON.parse(xhr.responseText);
            Zodiac.init();
            Zodiac.initControls();
            Zodiac.animate();
        } else {
            // show error message
        }
    };
    xhr.send(null);