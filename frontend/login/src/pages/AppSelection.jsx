import React, { useEffect, useState } from 'react';
import { navigateToApp } from '../services/AppNavigationService';
import { getSections } from '../services/sections';

export default function AppSelection() {
    const [sections, setSections] = useState([]);
    const [loading, setLoading] = useState(true);
    const [pageMeta, setPageMeta] = useState({
        title: 'Welcome to MMA System',
        subtitle: 'Manufacturing Management Applications',
        description: 'MMA is a comprehensive platform designed to streamline and optimize manufacturing operations.',
        features: [
            'Real-time equipment status monitoring',
            'Test utilization analytics and reporting',
            'Energy consumption tracking and optimization',
            'Comprehensive dashboard with visual insights',
            'Secure user authentication and role-based access',
        ],
    });

    const userData = localStorage.getItem('user');
    const user = userData && userData !== 'undefined' ? JSON.parse(userData) : null;
    const displayName = user
        ? user.displayName || user.member || `${user.firstName || ''} ${user.lastName || ''}`.trim()
        : '';

    useEffect(() => {
        const loadSections = async () => {
            try {
                const result = await getSections();
                if (Array.isArray(result)) {
                    setSections(result);
                    const heroSection = result.find((section) => section.id === 'hero');
                    if (heroSection) {
                        setPageMeta((prev) => ({
                            ...prev,
                            title: heroSection.title || heroSection.label || prev.title,
                            subtitle: heroSection.subtitle || prev.subtitle,
                            description: heroSection.description || prev.description,
                            features: Array.isArray(heroSection.features) && heroSection.features.length > 0 ? heroSection.features : prev.features,
                        }));
                    }
                }
            } catch (error) {
                console.error('Failed to load sections', error);
            } finally {
                setLoading(false);
            }
        };

        loadSections();
    }, []);

    const handleSelectApp = (app) => {
        navigateToApp(app, user?.token);
    };

    const handleLogout = () => {
        localStorage.removeItem('user');
        localStorage.removeItem('appMeta');
        window.location.reload();
    };

    return (
        <div style={{ minHeight: '100vh', backgroundColor: '#f0f0f0', padding: '2rem' }}>
            {/* Header */}
            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                <h1 style={{ color: '#333', fontSize: '2.5rem', marginBottom: '0.5rem' }}>{pageMeta.title}</h1>
                <p style={{ color: '#666', fontSize: '1.2rem' }}>{pageMeta.subtitle}</p>
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
                <p style={{ lineHeight: '1.6', color: '#555' }}>{pageMeta.description}</p>
                <div style={{ marginTop: '1rem' }}>
                    <h3 style={{ color: '#333' }}>Key Features:</h3>
                    <ul style={{ color: '#555', paddingLeft: '2rem' }}>
                        {pageMeta.features.map((feature, index) => (
                            <li key={index}>{feature}</li>
                        ))}
                    </ul>
                </div>
            </div>

            {/* Application Selection */}
            <div style={{ background: 'white', padding: '2rem', borderRadius: '8px', boxShadow: '0 0 10px rgba(0,0,0,0.1)', textAlign: 'center' }}>
                <h2 style={{ color: '#333', marginBottom: '1rem' }}>{pageMeta.title}</h2>
                <p style={{ color: '#666', marginBottom: '2rem' }}>เลือกแอปพลิเคชันจากรายการด้านล่าง</p>

                {loading ? (
                    <p>Loading applications...</p>
                ) : (
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                        {sections.filter((section) => section.id.startsWith('app-')).length > 0 ? (
                            sections
                                .filter((section) => section.id.startsWith('app-'))
                                .map((section) => {
                                    const appKey = section.appKey || (section.id === 'app-fec' ? 'fec' : section.id === 'app-utilization' ? 'test_utilization' : null);
                                    return (
                                        <div key={section.id} style={{ border: '1px solid #ddd', borderRadius: '8px', padding: '1rem', width: '250px' }}>
                                            <h3 style={{ color: appKey === 'fec' ? '#28a745' : '#007bff' }}>{section.title || section.label}</h3>
                                            <p style={{ color: '#555', marginBottom: '1rem' }}>
                                                {section.description || 'รายละเอียดของแอปพลิเคชันนี้'}
                                            </p>
                                            <button
                                                onClick={() => appKey && handleSelectApp(appKey)}
                                                disabled={!appKey}
                                                style={{
                                                    padding: '0.75rem 1.5rem',
                                                    backgroundColor: appKey === 'fec' ? '#28a745' : '#007bff',
                                                    color: 'white',
                                                    border: 'none',
                                                    borderRadius: '4px',
                                                    cursor: appKey ? 'pointer' : 'not-allowed',
                                                    fontSize: '1rem',
                                                }}
                                            >
                                                {section.buttonText || (appKey ? `Access ${section.label}` : 'Coming Soon')}
                                            </button>
                                        </div>
                                    );
                                })
                        ) : (
                            <p>No applications available at the moment.</p>
                        )}
                    </div>
                )}

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