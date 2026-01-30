interface SVGProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
}

const VideoIcon = ({ size = 48, className = '', ...props }: SVGProps) => (
  <svg
    width={size}
    height={size}
    viewBox="-4 0 64 64"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    {...props}
  >
    <defs>
      <linearGradient id="videoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#DC2626" />
        <stop offset="100%" stopColor="#B91C1C" />
      </linearGradient>
    </defs>
    <path
      d="M5.15.011c-2.801 0-5.072 2.272-5.072 5.074v53.841c0 2.803 2.272 5.074 5.072 5.074h45.775c2.802 0 5.075-2.271 5.075-5.074v-38.606l-18.904-20.309h-31.946z"
      fillRule="evenodd"
      clipRule="evenodd"
      fill="url(#videoGradient)"
    />
    <g fillRule="evenodd" clipRule="evenodd">
      <path
        d="M55.977 20.352v1h-12.799s-6.312-1.26-6.129-6.707c0 0 .208 5.707 6.004 5.707h12.924z"
        fill="url(#videoGradient)"
        opacity={0.7}
      />
      <path
        d="M37.074 0v14.561c0 1.656 1.104 5.791 6.104 5.791h12.799l-18.903-20.352z"
        opacity={0.3}
        fill="#ffffff"
      />
    </g>
    <path
      d="M24.531 45.529c0 .368-.163.736-.449.981-.205.163-5.255 4.417-11.839 7.095-.164.062-.327.103-.511.103-.225 0-.47-.062-.675-.184-.348-.205-.593-.573-.613-.981-.021-.144-.307-3.456-.307-7.014s.286-6.87.307-6.993c.021-.408.266-.776.613-1.002.205-.122.43-.184.675-.184.164 0 .348.041.511.103 6.584 2.678 11.634 6.932 11.839 7.115.286.225.449.593.449.961z"
      fill="#ffffff"
    />
  </svg>
);
export default VideoIcon;