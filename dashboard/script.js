/**
 * SeniorCare Dashboard - Main Application Script
 * Implementa monitoramento em tempo real com Firebase
 */

class SeniorCareDashboard {
    constructor() {
        this.db = window.seniorCareDB;
        this.currentData = null;
        this.alerts = [];
        this.isConnected = false;
        this.lastUpdateTime = null;
        
        // DOM Elements
        this.elements = {
            // Connection Status
            connectionStatus: document.getElementById('connectionStatus'),
            connectionText: document.getElementById('connectionText'),
            
            // Health Score
            healthScoreCircle: document.getElementById('healthScoreCircle'),
            healthScoreNumber: document.getElementById('healthScoreNumber'),
            overallStatus: document.getElementById('overallStatus'),
            lastUpdate: document.getElementById('lastUpdate'),
            healthIndicator: document.getElementById('healthIndicator'),
            
            // Sensor Values
            temperatureValue: document.getElementById('temperatureValue'),
            temperatureStatus: document.getElementById('temperatureStatus'),
            o2Value: document.getElementById('o2Value'),
            o2Status: document.getElementById('o2Status'),
            fallStatus: document.getElementById('fallStatus'),
            fallIndicator: document.getElementById('fallIndicator'),
            checkinStatus: document.getElementById('checkinStatus'),
            checkinIndicator: document.getElementById('checkinIndicator'),
            
            // Device Info
            deviceId: document.getElementById('deviceId'),
            ledStatus: document.getElementById('ledStatus'),
            humidityValue: document.getElementById('humidityValue'),
            
            // Alerts
            alertsContainer: document.getElementById('alertsContainer'),
            
            // Loading
            loadingOverlay: document.getElementById('loadingOverlay')
        };
        
        this.init();
    }
    
    async init() {
        try {
            console.log('🚀 Inicializando SeniorCare Dashboard...');
            
            // Setup real-time listeners
            this.setupRealTimeListeners();
            
            // Load initial data
            await this.loadInitialData();
            
            // Hide loading overlay
            setTimeout(() => {
                this.elements.loadingOverlay.classList.add('hidden');
            }, 2000);
            
            console.log('✅ Dashboard inicializado com sucesso!');
            
        } catch (error) {
            console.error('❌ Erro ao inicializar dashboard:', error);
            this.showError('Erro ao conectar com o Firebase. Verifique a configuração.');
        }
    }
    
    setupRealTimeListeners() {
        // Listen to current data updates
        this.db.collection('seniorcare').doc('current').onSnapshot((doc) => {
            if (doc.exists) {
                this.currentData = doc.data();
                this.updateDashboard(this.currentData);
                this.updateConnectionStatus(true);
            } else {
                console.log('Nenhum dado atual encontrado');
                this.updateConnectionStatus(false);
            }
        }, (error) => {
            console.error('Erro ao escutar dados em tempo real:', error);
            this.updateConnectionStatus(false);
        });
        
        // Listen to alerts
        this.db.collection('seniorcare-alerts')
            .orderBy('timestamp', 'desc')
            .limit(5)
            .onSnapshot((snapshot) => {
                this.alerts = [];
                snapshot.forEach((doc) => {
                    this.alerts.push({ id: doc.id, ...doc.data() });
                });
                this.updateAlertsDisplay();
            });
    }
    
    async loadInitialData() {
        try {
            // Load current data
            const currentDoc = await this.db.collection('seniorcare').doc('current').get();
            if (currentDoc.exists) {
                this.currentData = currentDoc.data();
                this.updateDashboard(this.currentData);
            }
            
            // Load recent alerts
            const alertsSnapshot = await this.db.collection('seniorcare-alerts')
                .orderBy('timestamp', 'desc')
                .limit(5)
                .get();
            
            this.alerts = [];
            alertsSnapshot.forEach((doc) => {
                this.alerts.push({ id: doc.id, ...doc.data() });
            });
            this.updateAlertsDisplay();
            
        } catch (error) {
            console.error('Erro ao carregar dados iniciais:', error);
            throw error;
        }
    }
    
    updateDashboard(data) {
        if (!data) return;
        
        console.log('📊 Atualizando dashboard:', data);
        
        // Update health score
        this.updateHealthScore(data.healthScore, data.overallStatus);
        
        // Update sensor values
        this.updateSensorValues(data);
        
        // Update device status
        this.updateDeviceStatus(data);
        
        // Update last update time
        this.updateLastUpdateTime(data.timestamp || data.lastUpdate);
        
        // Add animation to updated elements
        this.addUpdateAnimation();
    }
    
    updateHealthScore(score, status) {
        if (score === undefined || score === null) return;
        
        // Update score number
        this.elements.healthScoreNumber.textContent = score;
        
        // Update score circle progress
        const angle = (score / 100) * 360;
        this.elements.healthScoreCircle.style.setProperty('--score-angle', `${angle}deg`);
        
        // Update status text and color
        const statusConfig = this.getStatusConfig(status, score);
        this.elements.overallStatus.textContent = statusConfig.text;
        this.elements.overallStatus.style.color = statusConfig.color;
        
        // Update health indicator
        this.elements.healthIndicator.className = `health-indicator ${statusConfig.class}`;
        
        // Update score circle color based on score
        let circleColor = '#27ae60'; // Green
        if (score < 60) {
            circleColor = '#e74c3c'; // Red
        } else if (score < 80) {
            circleColor = '#f39c12'; // Orange
        }
        
        this.elements.healthScoreCircle.style.background = 
            `conic-gradient(${circleColor} 0deg, ${circleColor} ${angle}deg, #ecf0f1 ${angle}deg)`;
    }
    
    updateSensorValues(data) {
        // Temperature
        if (data.temperature !== undefined) {
            this.elements.temperatureValue.textContent = `${data.temperature.toFixed(1)}°C`;
            this.updateSensorStatus(this.elements.temperatureStatus, this.getTemperatureStatus(data.temperature));
        }
        
        // Oxygen Saturation
        if (data.o2Saturation !== undefined) {
            this.elements.o2Value.textContent = `${data.o2Saturation}%`;
            this.updateSensorStatus(this.elements.o2Status, this.getO2Status(data.o2Saturation));
        }
        
        // Fall Detection
        if (data.fallDetected !== undefined) {
            const fallStatus = data.fallDetected ? 'Queda Detectada!' : 'Normal';
            this.elements.fallStatus.textContent = fallStatus;
            this.updateSensorStatus(this.elements.fallIndicator, this.getFallStatus(data.fallDetected));
        }
        
        // Check-in Status
        if (data.checkinStatus !== undefined) {
            const checkinText = data.checkinStatus ? 'Realizado' : 'Pendente';
            this.elements.checkinStatus.textContent = checkinText;
            this.updateSensorStatus(this.elements.checkinIndicator, this.getCheckinStatus(data.checkinStatus));
        }
    }
    
    updateDeviceStatus(data) {
        // Device ID
        if (data.deviceId) {
            this.elements.deviceId.textContent = data.deviceId;
        }
        
        // LED Status
        if (data.ledStatus !== undefined) {
            const ledText = data.ledStatus ? 'Ligado' : 'Desligado';
            const ledColor = data.ledStatus ? '#e74c3c' : '#95a5a6';
            this.elements.ledStatus.innerHTML = `<i class="fas fa-circle" style="color: ${ledColor}"></i> ${ledText}`;
        }
        
        // Humidity
        if (data.humidity !== undefined) {
            this.elements.humidityValue.textContent = `${data.humidity.toFixed(1)}%`;
        }
    }
    
    updateSensorStatus(element, config) {
        element.className = `sensor-status ${config.class}`;
        element.innerHTML = `<i class="fas fa-circle"></i> <span>${config.text}</span>`;
    }
    
    updateAlertsDisplay() {
        const container = this.elements.alertsContainer;
        
        if (this.alerts.length === 0) {
            container.innerHTML = `
                <div class="no-alerts">
                    <i class="fas fa-check-circle"></i>
                    <p>Nenhum alerta no momento</p>
                </div>
            `;
            return;
        }
        
        const alertsHTML = this.alerts.map(alert => {
            const timeStr = this.formatAlertTime(alert.timestamp);
            const iconClass = this.getAlertIcon(alert.type);
            const severityClass = alert.severity ? alert.severity.toLowerCase() : 'warning';
            
            return `
                <div class="alert-item ${severityClass}">
                    <div class="alert-icon">
                        <i class="fas ${iconClass}"></i>
                    </div>
                    <div class="alert-content">
                        <h4>${alert.message}</h4>
                        <p>Tipo: ${alert.type} | Severidade: ${alert.severity}</p>
                    </div>
                    <div class="alert-time">${timeStr}</div>
                </div>
            `;
        }).join('');
        
        container.innerHTML = alertsHTML;
    }
    
    updateConnectionStatus(connected) {
        this.isConnected = connected;
        
        if (connected) {
            this.elements.connectionStatus.className = 'status-dot connected';
            this.elements.connectionText.textContent = 'Conectado';
        } else {
            this.elements.connectionStatus.className = 'status-dot disconnected';
            this.elements.connectionText.textContent = 'Desconectado';
        }
    }
    
    updateLastUpdateTime(timestamp) {
        if (!timestamp) return;
        
        let date;
        if (timestamp && timestamp.toDate) {
            date = timestamp.toDate(); // Firestore Timestamp
        } else if (timestamp instanceof Date) {
            date = timestamp;
        } else {
            date = new Date(timestamp);
        }
        
        const timeStr = date.toLocaleString('pt-BR');
        this.elements.lastUpdate.textContent = `Última atualização: ${timeStr}`;
        this.lastUpdateTime = date;
    }
    
    addUpdateAnimation() {
        // Add fade-in animation to updated elements
        const animatedElements = [
            this.elements.healthScoreCircle,
            ...document.querySelectorAll('.sensor-card')
        ];
        
        animatedElements.forEach(element => {
            element.classList.remove('fade-in');
            element.offsetHeight; // Trigger reflow
            element.classList.add('fade-in');
        });
    }
    
    // Status configuration helpers
    getStatusConfig(status, score) {
        if (status === 'CRITICAL' || score < 60) {
            return { text: 'Estado Crítico', color: '#e74c3c', class: 'critical' };
        } else if (status === 'WARNING' || score < 80) {
            return { text: 'Atenção', color: '#f39c12', class: 'warning' };
        } else {
            return { text: 'Saudável', color: '#27ae60', class: 'good' };
        }
    }
    
    getTemperatureStatus(temp) {
        if (temp < 36.0) {
            return { text: 'Baixa', class: 'warning' };
        } else if (temp > 37.5) {
            return { text: 'Elevada', class: 'critical' };
        } else {
            return { text: 'Normal', class: 'normal' };
        }
    }
    
    getO2Status(o2) {
        if (o2 < 90) {
            return { text: 'Crítico', class: 'critical' };
        } else if (o2 < 95) {
            return { text: 'Baixo', class: 'warning' };
        } else {
            return { text: 'Normal', class: 'normal' };
        }
    }
    
    getFallStatus(fallDetected) {
        if (fallDetected) {
            return { text: 'Queda!', class: 'critical' };
        } else {
            return { text: 'Estável', class: 'normal' };
        }
    }
    
    getCheckinStatus(checkinDone) {
        if (checkinDone) {
            return { text: 'Concluído', class: 'normal' };
        } else {
            return { text: 'Pendente', class: 'warning' };
        }
    }
    
    getAlertIcon(type) {
        const iconMap = {
            'FEVER': 'fa-thermometer-full',
            'HYPOTHERMIA': 'fa-thermometer-empty',
            'LOW_OXYGEN': 'fa-lungs',
            'FALL': 'fa-exclamation-triangle',
            'DEFAULT': 'fa-exclamation-circle'
        };
        return iconMap[type] || iconMap.DEFAULT;
    }
    
    formatAlertTime(timestamp) {
        if (!timestamp) return 'Agora';
        
        let date;
        if (timestamp && timestamp.toDate) {
            date = timestamp.toDate();
        } else if (timestamp instanceof Date) {
            date = timestamp;
        } else {
            date = new Date(timestamp);
        }
        
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        
        if (diffMins < 1) return 'Agora';
        if (diffMins < 60) return `${diffMins}min`;
        
        const diffHours = Math.floor(diffMins / 60);
        if (diffHours < 24) return `${diffHours}h`;
        
        return date.toLocaleDateString('pt-BR');
    }
    
    showError(message) {
        console.error('Dashboard Error:', message);
        this.elements.connectionStatus.className = 'status-dot disconnected';
        this.elements.connectionText.textContent = 'Erro de Conexão';
        
        // Show error in alerts
        this.elements.alertsContainer.innerHTML = `
            <div class="alert-item critical">
                <div class="alert-icon">
                    <i class="fas fa-exclamation-triangle"></i>
                </div>
                <div class="alert-content">
                    <h4>Erro de Conexão</h4>
                    <p>${message}</p>
                </div>
            </div>
        `;
    }
}

// Initialize dashboard when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Wait for Firebase to load
    const initDashboard = () => {
        if (typeof firebase !== 'undefined' && window.seniorCareDB) {
            new SeniorCareDashboard();
        } else {
            console.log('Aguardando Firebase carregar...');
            setTimeout(initDashboard, 500);
        }
    };
    
    initDashboard();
});

// Service Worker Registration (optional - for offline support)
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js').catch(console.log);
}
