// Load and render data from JSON
async function loadData() {
    try {
        const response = await fetch('data.json');
        const data = await response.json();
        renderPage(data);
    } catch (error) {
        console.error('Error loading data:', error);
    }
}

function renderPage(data) {
    // Hero Section
    document.getElementById('heroHeadline').textContent = data.headline;
    document.getElementById('heroTagline').textContent = data.tagline;

    // About Section
    document.getElementById('aboutTitle').textContent = data.about.title;
    document.getElementById('aboutSummary').textContent = data.about.summary;
    document.getElementById('aboutDescription').textContent = data.about.description;

    // LinkedIn link with icon
    const linkedinIcon = `<svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
        <rect x="2" y="2" width="20" height="20" rx="2" fill="currentColor"/>
        <text x="12" y="17" font-size="14" font-weight="700" fill="white" text-anchor="middle" font-family="Arial, sans-serif">in</text>
    </svg>`;

    if (data.contact && data.contact.linkedin) {
        const aboutLinks = document.getElementById('aboutLinks');
        aboutLinks.innerHTML = `<a href="${data.contact.linkedin}" target="_blank" class="about-link">${linkedinIcon}Connect on LinkedIn</a>`;
    }
}

// Mobile Menu Toggle
const menuToggle = document.getElementById('menuToggle');
const mainNav = document.getElementById('mainNav');

menuToggle.addEventListener('click', () => {
    menuToggle.classList.toggle('active');
    mainNav.classList.toggle('active');
});

// Close menu when a link is clicked
document.querySelectorAll('nav a').forEach(link => {
    link.addEventListener('click', () => {
        menuToggle.classList.remove('active');
        mainNav.classList.remove('active');
    });
});

// Smooth scroll for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    });
});

// ============================================================
// THREE.JS OCTOPUS & PARTICLE SYSTEM
// ============================================================

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
if (!prefersReducedMotion) {
    initThreeJS();
}

function initThreeJS() {
    console.log('Initializing Three.js octopus...');
    const canvas = document.getElementById('hero-canvas');

    if (!canvas) {
        console.error('Canvas element not found!');
        return;
    }

    if (typeof THREE === 'undefined') {
        console.error('Three.js not loaded!');
        return;
    }

    const scene = new THREE.Scene();

    const camera = new THREE.PerspectiveCamera(
        50,
        window.innerWidth / window.innerHeight,
        0.1,
        1000
    );
    camera.position.set(0, 0, 25);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({
        canvas: canvas,
        alpha: true,
        antialias: true
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0xffffff, 0);

    const mouse = { x: 0, y: 0, targetX: 0, targetY: 0 };

    window.addEventListener('mousemove', (e) => {
        mouse.targetX = (e.clientX / window.innerWidth) * 2 - 1;
        mouse.targetY = -(e.clientY / window.innerHeight) * 2 + 1;
    });

    window.addEventListener('touchmove', (e) => {
        if (e.touches.length > 0) {
            const touch = e.touches[0];
            mouse.targetX = (touch.clientX / window.innerWidth) * 2 - 1;
            mouse.targetY = -(touch.clientY / window.innerHeight) * 2 + 1;
        }
    }, { passive: true });

    window.addEventListener('touchend', () => {
        mouse.targetX = 0;
        mouse.targetY = 0;
    });

    function updateMouse() {
        mouse.x += (mouse.targetX - mouse.x) * 0.05;
        mouse.y += (mouse.targetY - mouse.y) * 0.05;
    }

    // ============================================================
    // OCTOPUS CREATION
    // ============================================================

    const octopusGroup = new THREE.Group();
    scene.add(octopusGroup);

    const headGeometry = new THREE.SphereGeometry(2.5, 32, 32);

    const headWireframeMaterial = new THREE.MeshBasicMaterial({
        color: 0x3A3A3A,
        wireframe: true,
        transparent: true,
        opacity: 0.8
    });
    const headWireframe = new THREE.Mesh(headGeometry, headWireframeMaterial);
    octopusGroup.add(headWireframe);

    const coreGeometry = new THREE.SphereGeometry(2.2, 16, 16);
    const coreMaterial = new THREE.MeshBasicMaterial({
        color: 0xD64933,
        transparent: true,
        opacity: 0.15
    });
    const core = new THREE.Mesh(coreGeometry, coreMaterial);
    octopusGroup.add(core);

    const tentacleCount = 8;
    const tentacles = [];

    class Tentacle {
        constructor(angle, index) {
            this.angle = angle;
            this.index = index;
            this.segments = [];
            this.segmentCount = 15;
            this.baseRadius = 2.5;
            this.length = 12;
            this.phase = (index / tentacleCount) * Math.PI * 2;
            this.lines = [];

            this.createTentacle();
        }

        createTentacle() {
            const points = [];

            for (let i = 0; i <= this.segmentCount; i++) {
                const t = i / this.segmentCount;

                const baseX = Math.cos(this.angle) * this.baseRadius;
                const baseY = Math.sin(this.angle) * this.baseRadius;

                const x = baseX + Math.cos(this.angle) * t * this.length * 0.6;
                const y = baseY + Math.sin(this.angle) * t * this.length * 0.6 - t * this.length * 0.8;
                const z = Math.sin(t * Math.PI) * 1.5;

                points.push(new THREE.Vector3(x, y, z));
                this.segments.push({ x, y, z, baseX: x, baseY: y, baseZ: z });
            }

            const geometry = new THREE.BufferGeometry().setFromPoints(points);
            const material = new THREE.LineBasicMaterial({
                color: 0x0F1011,
                transparent: true,
                opacity: 0.9,
                linewidth: 2
            });

            const line = new THREE.Line(geometry, material);
            this.lines.push(line);
            octopusGroup.add(line);

            const accentMaterial = new THREE.LineBasicMaterial({
                color: 0xD64933,
                transparent: true,
                opacity: 0.5,
                linewidth: 1
            });
            const accentLine = new THREE.Line(geometry.clone(), accentMaterial);
            this.lines.push(accentLine);
            octopusGroup.add(accentLine);
        }

        update(time, mouseInfluence) {
            const points = [];

            for (let i = 0; i <= this.segmentCount; i++) {
                const t = i / this.segmentCount;
                const segment = this.segments[i];

                const wave = Math.sin(time * 1.2 + this.phase + t * Math.PI * 2) * 0.8 * t;
                const wave2 = Math.cos(time * 0.8 + this.phase * 1.5 + t * Math.PI) * 0.5 * t;

                const influenceStrength = mouseInfluence * Math.pow(t, 1.5);
                const mouseOffsetX = mouse.x * 5 * influenceStrength;
                const mouseOffsetY = mouse.y * 5 * influenceStrength;

                const x = segment.baseX + wave * Math.cos(this.angle + Math.PI/2) + mouseOffsetX;
                const y = segment.baseY + wave * Math.sin(this.angle + Math.PI/2) + mouseOffsetY;
                const z = segment.baseZ + wave2;

                points.push(new THREE.Vector3(x, y, z));
            }

            this.lines.forEach(line => {
                line.geometry.setFromPoints(points);
            });
        }
    }

    for (let i = 0; i < tentacleCount; i++) {
        const angle = (i / tentacleCount) * Math.PI * 2;
        tentacles.push(new Tentacle(angle, i));
    }

    octopusGroup.position.set(3, 0, 0);

    // ============================================================
    // PARTICLE FIELD SYSTEM
    // ============================================================

    let particleCount = 50;
    if (window.innerWidth < 480) {
        particleCount = 20;
    } else if (window.innerWidth < 768) {
        particleCount = 30;
    } else if (window.innerWidth < 1024) {
        particleCount = 40;
    }

    const particles = [];
    const particleGeometry = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);

    class Particle {
        constructor(index) {
            this.index = index;

            this.baseX = (Math.random() - 0.5) * 30;
            this.baseY = (Math.random() - 0.5) * 20;
            this.baseZ = (Math.random() - 0.5) * 10;

            this.x = this.baseX;
            this.y = this.baseY;
            this.z = this.baseZ;

            this.phase = Math.random() * Math.PI * 2;
            this.speed = 0.3 + Math.random() * 0.4;
        }

        update(time) {
            const drift = Math.sin(time * this.speed + this.phase) * 0.8;
            const drift2 = Math.cos(time * this.speed * 0.7 + this.phase) * 0.6;

            const mouseDistX = mouse.x * 12 - this.baseX;
            const mouseDistY = mouse.y * 10 - this.baseY;
            const mouseDist = Math.sqrt(mouseDistX * mouseDistX + mouseDistY * mouseDistY);
            const mouseInfluence = Math.max(0, 1 - mouseDist / 18) * 1.5;

            this.x = this.baseX + drift + mouseInfluence * 0.5;
            this.y = this.baseY + drift2 + mouseInfluence * 0.5;
            this.z = this.baseZ + drift * 0.4;

            particlePositions[this.index * 3] = this.x;
            particlePositions[this.index * 3 + 1] = this.y;
            particlePositions[this.index * 3 + 2] = this.z;
        }
    }

    for (let i = 0; i < particleCount; i++) {
        particles.push(new Particle(i));
        particles[i].update(0);
    }

    particleGeometry.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));

    const particleMaterial = new THREE.PointsMaterial({
        color: 0x0F1011,
        size: 0.3,
        transparent: true,
        opacity: 0.85,
        sizeAttenuation: true
    });

    const particleSystem = new THREE.Points(particleGeometry, particleMaterial);
    scene.add(particleSystem);

    const lineGeometry = new THREE.BufferGeometry();
    const lineMaterial = new THREE.LineBasicMaterial({
        color: 0x3A3A3A,
        transparent: true,
        opacity: 0.2,
        linewidth: 1
    });
    const lines = new THREE.LineSegments(lineGeometry, lineMaterial);
    scene.add(lines);

    function updateParticleConnections() {
        const positions = [];
        const maxDistance = 8;

        for (let i = 0; i < particles.length; i++) {
            for (let j = i + 1; j < particles.length; j++) {
                const p1 = particles[i];
                const p2 = particles[j];

                const dx = p1.x - p2.x;
                const dy = p1.y - p2.y;
                const dz = p1.z - p2.z;
                const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);

                if (distance < maxDistance) {
                    positions.push(p1.x, p1.y, p1.z);
                    positions.push(p2.x, p2.y, p2.z);
                }
            }
        }

        lineGeometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    }

    // ============================================================
    // ANIMATION LOOP
    // ============================================================

    let time = 0;
    let frameCount = 0;

    function animate() {
        requestAnimationFrame(animate);

        time += 0.01;
        frameCount++;

        updateMouse();

        const mouseInfluence = Math.min(1, Math.sqrt(mouse.x * mouse.x + mouse.y * mouse.y) * 0.6);

        tentacles.forEach(tentacle => {
            tentacle.update(time, mouseInfluence);
        });

        octopusGroup.rotation.y = Math.sin(time * 0.3) * 0.15;
        octopusGroup.rotation.x = 0.2 + Math.cos(time * 0.25) * 0.1;

        particles.forEach(particle => {
            particle.update(time);
        });
        particleGeometry.attributes.position.needsUpdate = true;

        if (frameCount % 2 === 0) {
            updateParticleConnections();
        }

        renderer.render(scene, camera);
    }

    animate();

    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });

    window.addEventListener('scroll', () => {
        const heroHeight = document.getElementById('hero').offsetHeight;
        const scrollY = window.scrollY;
        const opacity = Math.max(0, 1 - (scrollY / heroHeight) * 1.5);
        canvas.style.opacity = opacity;
    });
}

// Load data on page load
loadData();
