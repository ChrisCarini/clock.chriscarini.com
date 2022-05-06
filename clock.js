const DEBUG = false;
const TRANSITION_TIME = 3;

// Thanks to https://formito.com/tools/favicon
const faviconHref = emoji => {
    return `data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%22256%22 height=%22256%22 viewBox=%220 0 100 100%22><text x=%2250%%22 y=%2250%%22 dominant-baseline=%22central%22 text-anchor=%22middle%22 font-size=%2280%22>${emoji}</text></svg>`;
}

const changeFavicon = emoji => {
    // Ensure we have access to the document, i.e. we are in the browser.
    if (typeof window === 'undefined') return

    const link =
        window.document.querySelector("link[rel*='icon']") ||
        window.document.createElement("link")
    link.type = "image/svg+xml"
    link.rel = "shortcut icon"
    link.href = faviconHref(emoji)

    window.document.getElementsByTagName("head")[0].appendChild(link)
}

const currentEmoji = () => {
    // Add 15 minutes and round down to closest half hour
    const time = new Date(Date.now() + 15 * 60 * 1000);

    const hours = time.getHours() % 12;
    const minutes = time.getMinutes() < 30 ? 0 : 30;

    return {
        "0.0": "🕛",
        "0.30": "🕧",
        "1.0": "🕐",
        "1.30": "🕜",
        "2.0": "🕑",
        "2.30": "🕝",
        "3.0": "🕒",
        "3.30": "🕞",
        "4.0": "🕓",
        "4.30": "🕟",
        "5.0": "🕔",
        "5.30": "🕠",
        "6.0": "🕕",
        "6.30": "🕡",
        "7.0": "🕖",
        "7.30": "🕢",
        "8.0": "🕗",
        "8.30": "🕦",
        "9.0": "🕘",
        "9.30": "🕤",
        "10.0": "🕙",
        "10.30": "🕥",
        "11.0": "🕚",
        "11.30": "🕦",
    }[`${hours}.${minutes}`]
}

const updateEmoji = () => {
    const emoji = currentEmoji();
    if (DEBUG) {
        console.log(`Setting favicon to: ${emoji}`);
    }
    changeFavicon(emoji);
}

function start_canvas() {
    // Entry point
    window.requestAnimationFrame(draw_canvas);

    // Change the favicon when the page gets loaded...
    updateEmoji();
}

async function draw_canvas() {
    // Get the canvas and the drawing context
    const canvas = document.getElementById("clock-canvas");
    const context = canvas.getContext("2d");

    // Clear the previous animation
    context.clearRect(0, 0, canvas.width, canvas.height);

    // Get the resolution just right
    fix_resolution(canvas);

    // Create all the clocks we need
    draw_clocks(canvas, context);

    let now = new Date();
    if (DEBUG) {
        console.log(`ANIMATE! - ${now.toISOString()}`);
    }
    // If the seconds are less than 55, then sleep for a second; otherwise, update update update!!!!!
    if (now.getSeconds() < 60 - TRANSITION_TIME) {
        await new Promise(r => setTimeout(r, 1000));
    }

    // Update the favicon
    if (now.getSeconds() === 0) {
        updateEmoji();
    }

    // Animate!
    window.requestAnimationFrame(draw_canvas);
}

function fix_resolution(canvas) {
    // Get the pixel density, canvas width, and canvas height
    // Use floor to cast as integer and slice to remove 'px' suffix
    const dpi = window.devicePixelRatio;
    const style_height = Math.floor(getComputedStyle(canvas).getPropertyValue("height").slice(0, -2));
    const style_width = Math.floor(getComputedStyle(canvas).getPropertyValue("width").slice(0, -2));

    canvas.setAttribute("height", style_height * dpi);
    canvas.setAttribute("width", style_width * dpi);
}

function draw_clocks(canvas, context) {
    // Update based on time
    const time = new Date();

    // Get all of the clock angles
    let angles = angle_array(time, TRANSITION_TIME);

    // If your width is smaller than your height, put two numbers on the
    // top row and two numbers on the bottom row.
    let l_angles;
    let idx;
    if (canvas.width < canvas.height) {
        l_angles = [[], [], [], [], [], [], [], [], [], [], [], []];
        idx = Math.floor(angles[0].length / 2);
        for (let i = 0; i < angles.length; i++) {
            l_angles[i] = l_angles[i].concat(angles[i].slice(0, idx));
            l_angles[i + angles.length] = l_angles[i + angles.length].concat(angles[i].slice(idx, angles[i].length));
        }
        angles = l_angles;
    }

    // Determine the clock diameter, x spacing, and y spacing based upon the aspect ratio
    let d;
    let x_space;
    let y_space;
    if (angles.length / angles[0].length > canvas.height / canvas.width) {
        // Clock diameter & spacing
        d = canvas.height / angles.length;
        x_space = (canvas.width - d * angles[0].length) / 2 + d / 2;
        y_space = d / 2;
    } else {
        // Clock diameter & spacing
        d = canvas.width / angles[0].length;
        x_space = d / 2;
        y_space = (canvas.height - d * angles.length) / 2 + d / 2;
    }

    // Draw each of the clocks
    for (let i = 0; i < angles.length; i++) {
        for (let j = 0; j < angles[0].length; j++) {
            const angle1 = angles[i][j][0];
            const angle2 = angles[i][j][1];
            const x = x_space + j * d;
            const y = y_space + i * d;
            draw_clock(context, x, y, d / 2, angle1, angle2);
        }
    }
}

function draw_clock(context, cx, cy, radius, angle1, angle2) {
    // Convert angles to radians - angles are clockwise
    angle1 *= Math.PI / 180;
    angle2 *= Math.PI / 180;

    // Draw the circle
    context.strokeStyle = "#3f3f3f";
    context.lineWidth = 2;
    context.beginPath();
    context.arc(cx, cy, radius, 0, 2 * Math.PI);
    context.stroke()
    context.strokeStyle = "#f0f0f0";
    context.lineWidth = 3;
    context.beginPath();
    context.moveTo(cx, cy);
    context.lineTo(cx + radius * Math.cos(angle1), cy + radius * Math.sin(angle1));
    context.moveTo(cx, cy);
    context.lineTo(cx + radius * Math.cos(angle2), cy + radius * Math.sin(angle2));
    context.stroke();
}

function angle_array(time1, dt) {
    // Add our transition period to the time to indicate which digits need to change (dt sec transition time)
    time2 = new Date(time1.getTime() + 1000 * dt);

    // Break out the hours, minutes, and seconds
    const h1 = time1.getHours();
    const h2 = time2.getHours();
    const m1 = time1.getMinutes();
    const m2 = time2.getMinutes();
    const s1 = time1.getSeconds() + time1.getMilliseconds() / 1000;
    const s2 = time2.getSeconds() + time2.getMilliseconds() / 1000;

    // Separate time into [hr_dig_1, hr_dig_2, sec_dig_1, sec_dig_2]
    const t1 = [Math.floor(h1 / 10), h1 % 10, Math.floor(m1 / 10), m1 % 10];
    const t2 = [Math.floor(h2 / 10), h2 % 10, Math.floor(m2 / 10), m2 % 10];

    // These are the interpolation values to use for each digit in t1/t2
    let trans1, trans2, trans3, trans4;
    if (t1[0] !== t2[0]) {
        // clock rolls every 10 hours until the 24th hour (roll at 4)
        trans1 = 1 - (60 * (((t1[0] < 2) ? 10 : 4) - h1) * (60 - m1) - s1) / dt;
    } else {
        trans1 = 0;
    }
    if (t1[1] !== t2[1]) {
        trans2 = 1 - (60 * (60 - m1) - s1) / dt;
    } else {
        trans2 = 0;
    }
    if (t1[2] !== t2[2]) {
        trans3 = 1 - (60 * (10 - m1 % 10) - s1) / dt;
    } else {
        trans3 = 0;
    }
    if (t1[3] !== t2[3]) {
        trans4 = 1 - (60 - s1) / dt;
    } else {
        trans4 = 0;
    }
    const v_lerp = [trans1, trans2, trans3, trans4];

    // Iterate over each digit to assign clock angles. Result is a 3D
    // array, where the first dimension is each row of clocks, the second
    // is each column, and the third is each [angle1, angle2]
    const angles = [[], [], [], [], [], []];
    for (let i = 0; i < angles.length; i++) {
        for (let j = 0; j < t1.length; j++) {
            const l_angles = transition(v_lerp[j], digit(t1[j]), digit(t2[j]));
            angles[i] = angles[i].concat(l_angles[i]);
        }
    }

    return angles;
}

function transition(v_lerp, digit1, digit2) {
    // Short circuit this function
    if (v_lerp === 0) {
        return digit1;
    } else if (v_lerp === 1) {
        return digit2;
    }

    // Perform a linear interpolation between the angles in digit1 and
    // digit2 by the amount specified in v_lerp
    const out = JSON.parse(JSON.stringify(digit1));
    for (let i = 0; i < digit1.length; i++) {
        for (let j = 0; j < digit1[0].length; j++) {
            for (let k = 0; k < digit1[0][0].length; k++) {
                const a = digit1[i][j][k];
                let b = digit2[i][j][k];
                // Force clockwise rotation
                if (b < a) {
                    b += 360;
                }
                out[i][j][k] = a + v_lerp * (b - a);
            }
        }
    }
    return out;
}

function digit(num) {
    // Only integer inputs allowed as num
    switch (num) {
        case 0:
            return [
                [state(0), state(1), state(1), state(2)],
                [state(3), state(0), state(2), state(3)],
                [state(3), state(3), state(3), state(3)],
                [state(3), state(3), state(3), state(3)],
                [state(3), state(5), state(4), state(3)],
                [state(5), state(1), state(1), state(4)]
            ];
        case 1:
            return [
                [state(0), state(1), state(2), state(-1)],
                [state(5), state(2), state(3), state(-1)],
                [state(-1), state(3), state(3), state(-1)],
                [state(-1), state(3), state(3), state(-1)],
                [state(0), state(4), state(5), state(2)],
                [state(5), state(1), state(1), state(4)]
            ];
        case 2:
            return [
                [state(0), state(1), state(1), state(2)],
                [state(5), state(1), state(2), state(3)],
                [state(0), state(1), state(4), state(3)],
                [state(3), state(0), state(1), state(4)],
                [state(3), state(5), state(1), state(2)],
                [state(5), state(1), state(1), state(4)]
            ];
        case 3:
            return [
                [state(0), state(1), state(1), state(2)],
                [state(5), state(1), state(2), state(3)],
                [state(0), state(1), state(4), state(3)],
                [state(5), state(1), state(2), state(3)],
                [state(0), state(1), state(4), state(3)],
                [state(5), state(1), state(1), state(4)]
            ];
        case 4:
            return [
                [state(0), state(2), state(0), state(2)],
                [state(3), state(3), state(3), state(3)],
                [state(3), state(5), state(4), state(3)],
                [state(5), state(1), state(2), state(3)],
                [state(-1), state(-1), state(3), state(3)],
                [state(-1), state(-1), state(5), state(4)]
            ];
        case 5:
            return [
                [state(0), state(1), state(1), state(2)],
                [state(3), state(0), state(1), state(4)],
                [state(3), state(5), state(1), state(2)],
                [state(5), state(1), state(2), state(3)],
                [state(0), state(1), state(4), state(3)],
                [state(5), state(1), state(1), state(4)]
            ];
        case 6:
            return [
                [state(0), state(1), state(1), state(2)],
                [state(3), state(0), state(1), state(4)],
                [state(3), state(5), state(1), state(2)],
                [state(3), state(0), state(2), state(3)],
                [state(3), state(5), state(4), state(3)],
                [state(5), state(1), state(1), state(4)]
            ];
        case 7:
            return [
                [state(0), state(1), state(1), state(2)],
                [state(5), state(1), state(2), state(3)],
                [state(-1), state(-1), state(3), state(3)],
                [state(-1), state(-1), state(3), state(3)],
                [state(-1), state(-1), state(3), state(3)],
                [state(-1), state(-1), state(5), state(4)]
            ];
        case 8:
            return [
                [state(0), state(1), state(1), state(2)],
                [state(3), state(0), state(2), state(3)],
                [state(3), state(5), state(4), state(3)],
                [state(3), state(0), state(2), state(3)],
                [state(3), state(5), state(4), state(3)],
                [state(5), state(1), state(1), state(4)]
            ];
        case 9:
            return [
                [state(0), state(1), state(1), state(2)],
                [state(3), state(0), state(2), state(3)],
                [state(3), state(5), state(4), state(3)],
                [state(5), state(1), state(2), state(3)],
                [state(0), state(1), state(4), state(3)],
                [state(5), state(1), state(1), state(4)]
            ];
        default:
            return []
    }
}

function state(num) {
    // State is 0-5 with anything else being the null state (we use -1)
    switch (num) {
        case 0:
            // Top-left corner
            return [0, 90];
        case 1:
            // Horizontal line
            return [0, 180];
        case 2:
            // Top-right corner
            return [90, 180];
        case 3:
            // Vertical line
            return [90, 270];
        case 4:
            // Bottom-right corner
            return [180, 270];
        case 5:
            // Bottom-left corner
            return [0, 270];
        default:
            // Point at 135 degrees
            return [135, 135];
    }
}