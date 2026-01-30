interface SVGProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
}

const FontIcon = ({ size = 48, className = '', ...props }: SVGProps) => (
  <svg
    width={size}
    height={size}
    viewBox="-4 0 64 64"
    xmlns="http://www.w3.org/2000/svg"
    className={`text-primary ${className}`}
    {...props}
  >
    <path
      d="M5.112-.004c-2.802 0-5.073 2.273-5.073 5.074v53.841c0 2.803 2.271 5.074 5.073 5.074h45.774c2.801 0 5.074-2.271 5.074-5.074v-38.605l-18.902-20.31h-31.946z"
      fillRule="evenodd"
      clipRule="evenodd"
      fill="currentColor"
    />
    <g fillRule="evenodd" clipRule="evenodd">
      <path
        d="M55.977 20.352v1h-12.799s-6.312-1.26-6.129-6.707c0 0 .208 5.707 6.004 5.707h12.924z"
        fill="currentColor"
        opacity={0.7}
      />
      <path
        d="M37.074 0v14.561c0 1.656 1.104 5.791 6.104 5.791h12.799l-18.903-20.352z"
        opacity={0.3}
        fill="#ffffff"
      />
    </g>
    <g fill="#ffffff">
      {/* 字母 A */}
      <path d="M13 52l4-14h2l4 14h-2.5l-0.8-3h-3.4l-0.8 3h-2.5zm3.3-5h2.4l-1.2-4.5-1.2 4.5z" />
      
      {/* 字母 a (小写) */}
      <path d="M25 45c0.8 0 1.5 0.3 2 0.8v-0.8h2v7h-2v-0.8c-0.5 0.5-1.2 0.8-2 0.8-1.7 0-3-1.3-3-3s1.3-3.5 3-3.5zm0.5 5c0.8 0 1.5-0.7 1.5-1.5s-0.7-1.5-1.5-1.5-1.5 0.7-1.5 1.5 0.7 1.5 1.5 1.5z" />
    </g>
  </svg>
);
export default FontIcon;
