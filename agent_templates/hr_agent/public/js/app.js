document.addEventListener('DOMContentLoaded', () => {
    // Navigation Logic
    const navItems = document.querySelectorAll('.nav-item');
    const sections = document.querySelectorAll('.section');

    // Dashboard Stats Logic
    async function updateStats() {
        try {
            const response = await fetch('/api/admin/stats');
            const data = await response.json();
            if (data.success) {
                document.getElementById('rankedCount').innerText = data.data.candidatesRanked;
                document.getElementById('onboardCount').innerText = data.data.activeOnboarding;
                document.getElementById('complianceRate').innerText = data.data.complianceRate + '%';
            }
        } catch (error) {
            console.error('Failed to update dashboard stats');
        }
    }

    updateStats();
    
    // Socket.IO Real-time Logic
    const socket = io();
    socket.on('statsUpdated', () => {
        console.log('Real-time update received!');
        updateStats();
    });

    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const target = item.getAttribute('data-section');

            navItems.forEach(nav => nav.classList.remove('active'));
            item.classList.add('active');

            sections.forEach(section => {
                section.classList.remove('active');
                if (section.id === target) {
                    section.classList.add('active');
                }
            });
        });
    });

    // Recruitment Logic
    const screenBtn = document.getElementById('screenBtn');
    const rankingResult = document.getElementById('rankingResult');

    screenBtn.addEventListener('click', async () => {
        const name = document.getElementById('candidateName').value;
        const resume = document.getElementById('resumeText').value;
        const jd = document.getElementById('jobDescription').value;

        if (!resume || !jd) {
            showToast('Please provide both resume and job description.', 'warning');
            return;
        }

        screenBtn.disabled = true;
        screenBtn.innerText = 'Analyzing with AI...';

        try {
            const response = await fetch('/api/candidates/screen', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ candidateName: name, resumeText: resume, jobDescription: jd })
            });

            const data = await response.json();

            if (!data.success) {
                showToast(data.error, 'error');
                addComplianceLog('Labor Law Violation', 'Candidate Screen', 'Failed');
            } else {
                displayRanking(data.data);
                addComplianceLog('Labor Law Check', 'Candidate Screen', 'Passed');
            }
        } catch (error) {
            showToast('Failed to connect to the agent.', 'error');
        } finally {
            screenBtn.disabled = false;
            screenBtn.innerText = 'Analyze & Rank Candidate';
        }
    });

    function displayRanking(data) {
        rankingResult.classList.remove('hidden');
        rankingResult.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
                <h3 style="font-size: 1.5rem;">${data.candidateName || 'AI Ranking'} Result</h3>
                <div style="font-size: 2rem; font-weight: 700; color: var(--primary-neon);">${data.score}%</div>
            </div>
            <p style="color: var(--text-dim); line-height: 1.6;">${data.reasoning}</p>
        `;
    }

    // Onboarding Logic
    const onboardBtn = document.getElementById('onboardBtn');
    const onboardingLog = document.getElementById('onboardingLog');

    onboardBtn.addEventListener('click', async () => {
        const name = document.getElementById('newHireName').value;
        const email = document.getElementById('newHireEmail').value;
        const dept = document.getElementById('newHireDept').value;
        const role = document.getElementById('newHireRole').value;

        if (!name || !email) {
            showToast('Name and Email are required.', 'warning');
            return;
        }

        onboardBtn.disabled = true;
        onboardBtn.innerText = 'Starting Workflow...';

        try {
            const response = await fetch('/agent/workflow', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    workflowType: 'onboarding', 
                    data: { name, email, department: dept, role } 
                })
            });

            const data = await response.json();

            if (!data.success) {
                showToast(data.error, 'error');
            } else {
                displayOnboardingSteps(data.data);
                addComplianceLog('Privacy Check', 'Onboarding', 'Passed');
            }
        } catch (error) {
            showToast('Failed to start onboarding.', 'error');
        } finally {
            onboardBtn.disabled = false;
            onboardBtn.innerText = 'Start Onboarding Workflow';
        }
    });

    function displayOnboardingSteps(data) {
        onboardingLog.classList.remove('hidden');
        onboardingLog.innerHTML = `
            <h3 style="margin-bottom: 1rem;">Automated Checklist for ${data.employee.name}</h3>
            <ul style="list-style: none; display: flex; flex-direction: column; gap: 0.75rem; margin-bottom: 1.5rem;">
                ${data.checklist.map(step => `
                    <li style="display: flex; align-items: center; gap: 0.75rem; color: var(--text-dim);">
                        <span style="color: var(--success);">✓</span> ${step}
                    </li>
                `).join('')}
            </ul>
            <div style="padding: 1rem; background: rgba(255,255,255,0.05); border-radius: 8px;">
                <h4 style="color: var(--secondary-neon); margin-bottom: 0.5rem;">Payroll Profile Initialized</h4>
                <div style="display: flex; justify-content: space-between; font-size: 0.9rem;">
                    <span>ID: ${data.payroll.payrollId}</span>
                    <span>Salary: $${data.payroll.annualBaseSalary.toLocaleString()} ${data.payroll.currency}</span>
                </div>
            </div>
        `;
    }

    // Global Helpers
    function showToast(message, type) {
        const toast = document.getElementById('toast');
        toast.innerText = message;
        toast.className = `toast ${type}`;
        toast.classList.remove('hidden');
        setTimeout(() => toast.classList.add('hidden'), 5000);
    }

    function addComplianceLog(check, target, status) {
        const logs = document.getElementById('complianceLogs');
        const row = document.createElement('tr');
        const timestamp = new Date().toLocaleTimeString();
        row.innerHTML = `
            <td>${timestamp}</td>
            <td>${check}</td>
            <td>${target}</td>
            <td><span class="status-tag ${status.toLowerCase() === 'passed' ? 'success' : 'error'}">${status}</span></td>
        `;
        logs.prepend(row);
    }

    // Knowledge Base Ingestion Logic
    const ingestBtn = document.getElementById('ingestBtn');
    const ingestResult = document.getElementById('ingestResult');

    ingestBtn.addEventListener('click', async () => {
        const id = document.getElementById('docId').value;
        const text = document.getElementById('docContent').value;
        const category = document.getElementById('docCategory').value;

        if (!text) {
            showToast('Document content is required.', 'warning');
            return;
        }

        ingestBtn.disabled = true;
        ingestBtn.innerText = 'Vectorizing with Gemini...';

        try {
            const response = await fetch('/api/admin/ingest', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id, text, category })
            });

            const data = await response.json();

            if (!data.success) {
                showToast(data.error, 'error');
            } else {
                showToast('Knowledge Base updated successfully!', 'success');
                ingestResult.classList.remove('hidden');
                ingestResult.innerHTML = `
                    <h4 style="color: var(--success); margin-bottom: 0.5rem;">Document Ingested</h4>
                    <p style="font-size: 0.9rem; color: var(--text-dim);">ID: ${data.id}</p>
                `;
                document.getElementById('docContent').value = '';
                document.getElementById('docId').value = '';
            }
        } catch (error) {
            showToast('Failed to ingest document.', 'error');
        } finally {
            ingestBtn.disabled = false;
            ingestBtn.innerText = 'Vectorize & Store in Knowledge Base';
        }
    });
});
