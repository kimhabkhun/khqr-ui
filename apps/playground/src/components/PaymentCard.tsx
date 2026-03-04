import React from 'react';
import './PaymentCard.css';

interface PaymentCardProps {
  name: string;
  amount: string;
  currency: string;
}

const PaymentCard: React.FC<PaymentCardProps> = ({ name, amount, currency }) => {
  return (
    <div className="card-container">
      {/* Red Header Section */}
      <div className="card-header">
        <h1 className="logo-text">KHQR</h1>
      </div>

      <div className="card-body">
        {/* Info Section */}
        <div className="info-section">
          <p className="user-name">{name}</p>
          <div className="amount-row">
            <span className="amount-value">{amount}</span>
            <span className="currency-label">{currency}</span>
          </div>
        </div>

        {/* Dashed Separator */}
        <div className="dashed-line"></div>

        {/* QR Section */}
        <div className="qr-section">
          <div className="qr-placeholder">
             {/* You can replace this img tag with a real QR generator component later */}
             <img 
              src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=Bakong" 
              alt="QR Code" 
            />
            <div className="qr-logo-center">
               <span>៛</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentCard;