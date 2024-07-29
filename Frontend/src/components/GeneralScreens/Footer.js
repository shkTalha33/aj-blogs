import React from 'react';
import '../../Css/Footer.css'

const Footer = () => {
    const year = new Date().getFullYear()
    return (
        <div>
            <div className="footer">
            </div>
            <div className="copyright">
                <p className="copyright-blog">&copy; {year} AJ Blogs. All Rights Reserved</p>
            </div>
        </div>
    )
}

export default Footer;
