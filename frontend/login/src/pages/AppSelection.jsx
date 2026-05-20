import React from 'react';

export default function AppSelection() {
    const userData = localStorage.getItem("user");
    const user = userData && userData !== "undefined" ? JSON.parse(userData) : null;
    const displayName = user
        ? user.displayName || user.member || `${user.firstName || ""} ${user.lastName || ""}`.trim()
        : "";

    const buildAppUrl = (baseUrl) => {
        const params = new URLSearchParams({
            memberID: user?.memberID || "",
            member: user?.displayName || user?.member || "",
            position: user?.position || "",
            username: user?.username || "",
        });
        return `${baseUrl}?${params.toString()}`;
    };

    const handleSelectApp = (app) => {
        if (app === 'fec') {
            const fecUrl = import.meta.env.VITE_FEC_URL || 'http://localhost:5173';
            window.location.href = buildAppUrl(fecUrl);
        } else if (app === 'test_utilization') {
            const testUrl = import.meta.env.VITE_TEST_UTILIZATION_URL || 'http://localhost:5174';
            window.location.href = buildAppUrl(testUrl);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('user');
        window.location.reload();
    };

    return (
        <div style={{ minHeight: '100vh', backgroundColor: '#f0f0f0', padding: '2rem' }}>
            {/* Header */}
            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                <h1 style={{ color: '#333', fontSize: '2.5rem', marginBottom: '0.5rem' }}>Welcome to MMA System</h1>
                <p style={{ color: '#666', fontSize: '1.2rem' }}>Manufacturing Management Applications</p>
            </div>

            {/* User Info */}
            {user && (
                <div style={{ background: 'white', padding: '1rem', borderRadius: '8px', boxShadow: '0 0 10px rgba(0,0,0,0.1)', marginBottom: '2rem', textAlign: 'center' }}>
                    <h3>Hello, {displayName || 'User'}!</h3>
                    <p>Position: {user.position || '-'}</p>
                    <p>Member ID: {user.memberID || '-'}</p>
                </div>
            )}

            {/* Organization Introduction */}
            <div style={{ background: 'white', padding: '2rem', borderRadius: '8px', boxShadow: '0 0 10px rgba(0,0,0,0.1)', marginBottom: '2rem' }}>
                <h2 style={{ color: '#333', marginBottom: '1rem' }}>About Our Organization</h2>
                <p style={{ lineHeight: '1.6', color: '#555' }}>
                    MMA (Manufacturing Management Applications) is a comprehensive system designed to streamline and optimize manufacturing processes.
                    Our platform provides integrated solutions for equipment monitoring, test utilization tracking, and facility energy consumption management.
                    With real-time data analytics and user-friendly interfaces, we help organizations improve efficiency, reduce downtime, and make data-driven decisions.
                </p>
                <div style={{ marginTop: '1rem' }}>
                    <h3 style={{ color: '#333' }}>Key Features:</h3>
                    <ul style={{ color: '#555', paddingLeft: '2rem' }}>
                        <li>Real-time equipment status monitoring</li>
                        <li>Test utilization analytics and reporting</li>
                        <li>Energy consumption tracking and optimization</li>
                        <li>Comprehensive dashboard with visual insights</li>
                        <li>Secure user authentication and role-based access</li>
                    </ul>
                </div>
            </div>

            {/* Application Selection */}
            <div style={{ background: 'white', padding: '2rem', borderRadius: '8px', boxShadow: '0 0 10px rgba(0,0,0,0.1)', textAlign: 'center' }}>
                <h2 style={{ color: '#333', marginBottom: '1rem' }}>Available Applications</h2>
                <p style={{ color: '#666', marginBottom: '2rem' }}>Select an application to access detailed features and data:</p>

                <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                    <div style={{ border: '1px solid #ddd', borderRadius: '8px', padding: '1rem', width: '250px' }}>
                        <h3 style={{ color: '#28a745' }}>FEC Application</h3>
                        <p style={{ color: '#555', marginBottom: '1rem' }}>Facility Energy Consumption monitoring and analytics</p>
                        <button
                            onClick={() => handleSelectApp('fec')}
                            style={{ padding: '0.75rem 1.5rem', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '1rem' }}
                        >
                            Access FEC
                        </button>
                    </div>

                    <div style={{ border: '1px solid #ddd', borderRadius: '8px', padding: '1rem', width: '250px' }}>
                        <h3 style={{ color: '#007bff' }}>Test Utilization</h3>
                        <p style={{ color: '#555', marginBottom: '1rem' }}>Test equipment utilization tracking and management</p>
                        <button
                            onClick={() => handleSelectApp('test_utilization')}
                            style={{ padding: '0.75rem 1.5rem', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '1rem' }}
                        >
                            Access Test Utilization
                        </button>
                    </div>
                </div>

                <div style={{ marginTop: '2rem' }}>
                    <button
                        onClick={handleLogout}
                        style={{ padding: '0.5rem 1rem', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                    >
                        Logout
                    </button>
                </div>
            </div>
        </div>
    );
}