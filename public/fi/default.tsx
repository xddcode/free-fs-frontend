interface SVGProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
}

const DefaultIcon = ({ size = 48, className = '', ...props }: SVGProps) => (
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
      {/* 两条横线表示文件 */}
      <rect x="12" y="42" width="20" height="3" rx="1.5" />
      <rect x="12" y="48" width="20" height="3" rx="1.5" />
    </g>
  </svg>
);
export default DefaultIcon;