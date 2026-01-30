interface SVGProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
}

const PptIcon = ({ size = 48, className = '', ...props }: SVGProps) => (
  <svg
    width={size}
    height={size}
    viewBox="-4 0 64 64"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    {...props}
  >
    <defs>
      <linearGradient id="pptGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#F59E0B" />
        <stop offset="100%" stopColor="#D97706" />
      </linearGradient>
    </defs>
    <path
      d="M5.111.009c-2.801 0-5.072 2.272-5.072 5.074v53.841c0 2.803 2.271 5.074 5.072 5.074h45.775c2.801 0 5.074-2.271 5.074-5.074v-38.606l-18.903-20.309h-31.946z"
      fillRule="evenodd"
      clipRule="evenodd"
      fill="url(#pptGradient)"
    />
    <path
      d="M10.123 37.465v11.9h12.417v-11.9h-12.417zm11.289 9.642h-10.16v-7.386h10.16v7.386zm.674-5.128v2.259h8.386v7.385h-10.16v-2.846h-1.129v5.104h12.419v-11.902h-9.516z"
      fill="#ffffff"
    />
    <g fillRule="evenodd" clipRule="evenodd">
      <path
        d="M55.96 20.377v1h-12.799s-6.312-1.26-6.129-6.707c0 0 .208 5.707 6.004 5.707h12.924z"
        fill="url(#pptGradient)"
        opacity={0.7}
      />
      <path
        d="M37.058.025v14.561c0 1.656 1.104 5.791 6.104 5.791h12.799l-18.903-20.352z"
        opacity={0.3}
        fill="#ffffff"
      />
    </g>
  </svg>
);
export default PptIcon;
