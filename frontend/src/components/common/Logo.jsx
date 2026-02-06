import React from 'react';

const Logo = ({ className = "flex items-center gap-3", showText = true, showIcon = true, textClassName = "text-xl font-bold tracking-tight uppercase" }) => {
    return (
        <div className={className}>
            {showIcon && (
                <div className="flex items-center justify-center text-primary">
                    <svg className="size-8" fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                        <path d="M42.4379 44C42.4379 44 36.0744 33.9038 41.1692 24C46.8624 12.9336 42.2078 4 42.2078 4L7.01134 4C7.01134 4 11.6577 12.932 5.96912 23.9969C0.876273 33.9029 7.27094 44 7.27094 44L42.4379 44Z" fill="currentColor"></path>
                    </svg>
                </div>
            )}
            {showText && <h2 className={`${textClassName} text-white`}>Nexo</h2>}
        </div>
    );
};

export default Logo;
