
import React from 'react';

const ComingSoon = ({ title = "Cette fonctionnalité" }) => {
    return (
        <div className="flex flex-col items-center justify-center py-12 px-4 bg-white rounded-lg border border-slate-200">
            <div className="bg-blue-100 p-8 rounded-full mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
            </div>
            <h3 className="text-xl font-semibold text-slate-800 mb-2">{title} arrive bientôt!</h3>
            <p className="text-slate-500 text-center max-w-md">
                Nous travaillons actuellement sur cette fonctionnalité pour améliorer votre expérience de recrutement.
                Revenez bientôt pour découvrir les nouvelles fonctionnalités.
            </p>
        </div>
    );
};

export default ComingSoon;