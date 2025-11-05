/**
 * @typedef {Object} WordleData
 * @property {number} id
 * @property {string} solution
 * @property {string} print_date
 * @property {number} [days_since_launch]
 * @property {string} [editor]
 */

const moonIconPath = 'M21.752 15.002A9.72 9.72 0 0 1 18 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 0 0 3 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 0 0 9.002-5.998Z';
const sunIconPath = 'M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-4.227-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z';

const themeToggle = document.getElementById('themeToggle');
const themeIcon = document.getElementById('themeIcon');
const themeText = document.getElementById('themeText');
const html = document.documentElement;

/**
 * @param {string} theme
 * @returns {void}
 */
function setTheme(theme) {
    html.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
    if (theme === 'dark') {
        themeIcon.innerHTML = `<path stroke-linecap="round" stroke-linejoin="round" d="${sunIconPath}"/>`;
        themeText.textContent = 'Light Mode';
    } else {
        themeIcon.innerHTML = `<path stroke-linecap="round" stroke-linejoin="round" d="${moonIconPath}"/>`;
        themeText.textContent = 'Dark Mode';
    }
}

/**
 * @returns {string}
 */
function getInitialTheme() {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) return savedTheme;
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        return 'dark';
    }
    return 'light';
}

setTheme(getInitialTheme());

if (window.matchMedia) {
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
        if (!localStorage.getItem('theme')) {
            setTheme(e.matches ? 'dark' : 'light');
        }
    });
}

themeToggle.addEventListener('click', () => {
    const currentTheme = html.getAttribute('data-theme');
    setTheme(currentTheme === 'dark' ? 'light' : 'dark');
});

/**
 * @param {Date} date
 * @returns {string}
 */
function formatDateForAPI(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

/**
 * @param {Date} date
 * @returns {string}
 */
function formatDateForDisplay(date) {
    return date.toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    });
}

/**
 * @param {string} dateStr
 * @returns {Date|null}
 */
function parseDateParam(dateStr) {
    const parts = dateStr.split('-');
    if (parts.length !== 3) return null;
    const [day, month, year] = parts.map(Number);
    if (isNaN(day) || isNaN(month) || isNaN(year)) return null;
    return new Date(year, month - 1, day);
}

/**
 * @returns {Date}
 */
function getMaxAllowedDate() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const maxDate = new Date(today);
    maxDate.setDate(maxDate.getDate() + 21);
    return maxDate;
}

/**
 * @returns {Date}
 */
function getWordleLaunchDate() {
    const launchDate = new Date(2021, 5, 19);
    launchDate.setHours(0, 0, 0, 0);
    return launchDate;
}

/**
 * @param {Date} date
 * @returns {boolean}
 */
function isDateAllowed(date) {
    const maxDate = getMaxAllowedDate();
    const launchDate = getWordleLaunchDate();
    return date >= launchDate && date <= maxDate;
}

const urlParams = new URLSearchParams(window.location.search);
const dateParam = urlParams.get('date');
let selectedDate = dateParam ? parseDateParam(dateParam) : new Date();
if (!selectedDate || isNaN(selectedDate.getTime())) {
    selectedDate = new Date();
}
selectedDate.setHours(0, 0, 0, 0);

let currentCalendarMonth = new Date(selectedDate);
currentCalendarMonth.setDate(1);

/** @type {WordleData|null} */
let currentAnswer = null;

const months = ['January', 'February', 'March', 'April', 'May', 'June', 
               'July', 'August', 'September', 'October', 'November', 'December'];

const monthSelect = document.getElementById('monthSelect');
const monthDisplay = document.getElementById('monthDisplay');
const monthDropdown = document.getElementById('monthDropdown');
const yearSelect = document.getElementById('yearSelect');
const yearDisplay = document.getElementById('yearDisplay');
const yearDropdown = document.getElementById('yearDropdown');

months.forEach((month, idx) => {
    const option = document.createElement('div');
    option.className = 'select-option';
    option.textContent = month;
    option.dataset.value = idx.toString();
    option.addEventListener('click', () => {
        currentCalendarMonth.setMonth(idx);
        monthDisplay.textContent = month;
        closeAllDropdowns();
        renderCalendar();
    });
    monthDropdown.appendChild(option);
});

const launchYear = getWordleLaunchDate().getFullYear();
const maxAllowedYear = getMaxAllowedDate().getFullYear();
for (let year = launchYear; year <= maxAllowedYear; year++) {
    const option = document.createElement('div');
    option.className = 'select-option';
    option.textContent = year.toString();
    option.dataset.value = year.toString();
    option.addEventListener('click', () => {
        currentCalendarMonth.setFullYear(year);
        yearDisplay.textContent = year.toString();
        closeAllDropdowns();
        renderCalendar();
    });
    yearDropdown.appendChild(option);
}

monthSelect.querySelector('.select-display').addEventListener('click', (e) => {
    e.stopPropagation();
    const isOpen = monthDropdown.classList.contains('open');
    closeAllDropdowns();
    if (!isOpen) {
        monthDropdown.classList.add('open');
        monthSelect.querySelector('.select-display').classList.add('open');
    }
});

yearSelect.querySelector('.select-display').addEventListener('click', (e) => {
    e.stopPropagation();
    const isOpen = yearDropdown.classList.contains('open');
    closeAllDropdowns();
    if (!isOpen) {
        yearDropdown.classList.add('open');
        yearSelect.querySelector('.select-display').classList.add('open');
    }
});

/**
 * @returns {void}
 */
function closeAllDropdowns() {
    monthDropdown.classList.remove('open');
    yearDropdown.classList.remove('open');
    monthSelect.querySelector('.select-display').classList.remove('open');
    yearSelect.querySelector('.select-display').classList.remove('open');
}

document.addEventListener('click', closeAllDropdowns);

/**
 * @param {Date} date
 * @returns {Promise<WordleData>}
 */
async function fetchWordleAnswer(date) {
    const apiDate = formatDateForAPI(date);
    const url = `https://www.nytimes.com/svc/wordle/v2/${apiDate}.json`;
    
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error('Answer not available for this date');
    }
    return await response.json();
}

/**
 * @param {WordleData} data
 * @param {Date} date
 * @returns {void}
 */
function displayAnswer(data, date) {
    const dateLabel = document.getElementById('dateLabel');
    const answerDisplay = document.getElementById('answerDisplay');
    const metaInfo = document.getElementById('metaInfo');
    const errorContainer = document.getElementById('errorContainer');
    const answerPreview = document.getElementById('answerPreview');

    errorContainer.innerHTML = '';
    dateLabel.textContent = formatDateForDisplay(date);
    currentAnswer = data;

    const letters = data.solution.toUpperCase().split('');
    answerDisplay.innerHTML = letters.map(letter => 
        `<div class="letter-box">${letter}</div>`
    ).join('');

    answerPreview.textContent = data.solution.toUpperCase();

    const daysSinceLaunch = data.days_since_launch !== undefined ? data.days_since_launch : 0;
    const editor = data.editor || '---';

    metaInfo.innerHTML = `
        <div class="meta-item">
            <div class="meta-label">Puzzle #</div>
            <div class="meta-value">${data.id}</div>
        </div>
        <div class="meta-item">
            <div class="meta-label">Days Since Launch</div>
            <div class="meta-value">${daysSinceLaunch}</div>
        </div>
        <div class="meta-item">
            <div class="meta-label">Editor</div>
            <div class="meta-value">${editor}</div>
        </div>
    `;
}

/**
 * @param {string} message
 * @returns {void}
 */
function showError(message) {
    const errorContainer = document.getElementById('errorContainer');
    errorContainer.innerHTML = `<div class="error">⚠️ ${message}</div>`;
}

/**
 * @param {string} message
 * @returns {void}
 */
function showToast(message) {
    const toast = document.createElement('div');
    toast.className = 'success-toast';
    toast.innerHTML = `
        <svg style="width: 20px; height: 20px; stroke: currentColor; fill: none; stroke-width: 1.5;" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="m4.5 12.75 6 6 9-13.5" />
        </svg>
        ${message}
    `;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
}

/**
 * @param {WordleData} data
 * @param {Date} date
 * @returns {Promise<void>}
 */
async function updateMetaTags(data, date) {
    const isToday = date.toDateString() === new Date().toDateString();
    const dateStr = formatDateForDisplay(date);
    const answer = data.solution.toUpperCase();
    
    let title, description;
    if (isToday) {
        title = `Today's Wordle Answer is ${answer} - Unwordled`;
        description = `Today's Wordle #${data.id} answer is ${answer}! Find daily Wordle solutions on Unwordled.`;
    } else {
        title = `Wordle Answer for ${dateStr} is ${answer} - Unwordled`;
        description = `Wordle #${data.id} answer for ${dateStr} is ${answer}. Discover past and future Wordle answers on Unwordled.`;
    }

    document.title = title;
    document.querySelector('meta[property="og:title"]').setAttribute('content', title);
    document.querySelector('meta[property="og:description"]').setAttribute('content', description);
    document.querySelector('meta[name="twitter:title"]').setAttribute('content', title);
    document.querySelector('meta[name="twitter:description"]').setAttribute('content', description);
    document.querySelector('meta[name="description"]').setAttribute('content', description);
    
    if (typeof window.generateOGImage === 'function') {
        const ogImageDataUrl = await window.generateOGImage(data, date);
        document.querySelector('meta[property="og:image"]').setAttribute('content', ogImageDataUrl);
        document.querySelector('meta[name="twitter:image"]').setAttribute('content', ogImageDataUrl);
    }
}

/**
 * @param {Date} date
 * @returns {Promise<void>}
 */
async function loadAnswer(date) {
    try {
        const data = await fetchWordleAnswer(date);
        displayAnswer(data, date);
        await updateMetaTags(data, date);
    } catch (error) {
        showError(error.message);
        document.getElementById('answerDisplay').innerHTML = 
            '<div class="loading">Unable to load answer</div>';
    }
}

/**
 * @returns {void}
 */
function updateURL() {
    const day = String(selectedDate.getDate()).padStart(2, '0');
    const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
    const year = selectedDate.getFullYear();
    const dateStr = `${day}-${month}-${year}`;
    const newUrl = `${window.location.pathname}?date=${dateStr}`;
    window.history.pushState({}, '', newUrl);
}

document.getElementById('shareBtn').addEventListener('click', async () => {
    if (!currentAnswer) return;

    const day = String(selectedDate.getDate()).padStart(2, '0');
    const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
    const year = selectedDate.getFullYear();
    const dateStr = `${day}-${month}-${year}`;
    const shareUrl = `${window.location.origin}${window.location.pathname}?date=${dateStr}`;
    const shareText = `Wordle #${currentAnswer.id} answer: ${currentAnswer.solution.toUpperCase()} - Found on Unwordled`;

    if (navigator.share) {
        try {
            await navigator.share({
                title: 'Unwordled',
                text: shareText,
                url: shareUrl
            });
        } catch (err) {
            if (err.name !== 'AbortError') {
                copyToClipboard(shareUrl);
            }
        }
    } else {
        copyToClipboard(shareUrl);
    }
});

document.getElementById('copyAnswerBtn').addEventListener('click', () => {
    if (!currentAnswer) return;
    const text = currentAnswer.solution.toUpperCase();
    copyToClipboard(text);
});

/**
 * @param {string} text
 * @returns {void}
 */
function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
        showToast('Copied to clipboard!');
    }).catch(() => {
        showToast('Failed to copy');
    });
}

/**
 * @returns {void}
 */
function renderCalendar() {
    const calendarDays = document.getElementById('calendarDays');

    const year = currentCalendarMonth.getFullYear();
    const month = currentCalendarMonth.getMonth();

    monthDisplay.textContent = months[month];
    yearDisplay.textContent = year.toString();

    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const maxDate = getMaxAllowedDate();
    const launchDate = getWordleLaunchDate();

    calendarDays.innerHTML = '';

    for (let i = 0; i < firstDay; i++) {
        calendarDays.innerHTML += '<div class="day-cell empty"></div>';
    }

    for (let day = 1; day <= daysInMonth; day++) {
        const cellDate = new Date(year, month, day);
        cellDate.setHours(0, 0, 0, 0);
        const isSelected = cellDate.getTime() === selectedDate.getTime();
        const isToday = cellDate.getTime() === today.getTime();
        const isDisabled = cellDate > maxDate || cellDate < launchDate;

        const classes = ['day-cell'];
        if (isSelected) classes.push('selected');
        if (isToday) classes.push('today');
        if (isDisabled) classes.push('disabled');

        const dayCell = document.createElement('div');
        dayCell.className = classes.join(' ');
        dayCell.textContent = day.toString();
        
        if (!isDisabled) {
            dayCell.addEventListener('click', () => {
                selectedDate = new Date(year, month, day);
                selectedDate.setHours(0, 0, 0, 0);
                loadAnswer(selectedDate);
                renderCalendar();
                updateURL();
            });
        }

        calendarDays.appendChild(dayCell);
    }
}

document.getElementById('prevMonth').addEventListener('click', () => {
    currentCalendarMonth.setMonth(currentCalendarMonth.getMonth() - 1);
    renderCalendar();
});

document.getElementById('nextMonth').addEventListener('click', () => {
    currentCalendarMonth.setMonth(currentCalendarMonth.getMonth() + 1);
    renderCalendar();
});

document.getElementById('todayBtn').addEventListener('click', () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    selectedDate = today;
    currentCalendarMonth = new Date(today);
    currentCalendarMonth.setDate(1);
    loadAnswer(selectedDate);
    renderCalendar();
    updateURL();
});

loadAnswer(selectedDate);
renderCalendar();
