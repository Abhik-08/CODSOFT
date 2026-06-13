import React from 'react'

interface LogoProps {
  className?: string
  iconSize?: number
  showText?: boolean
  textSize?: string
}

export const EduVaultLogoMark: React.FC<{ className?: string; size?: number }> = ({ 
  className = "", 
  size = 92
}) => {
  // Upscale logo size by 1.25x as requested
  const finalSize = Math.round(size * 1.25)
  return (
    <img
      src="/logo.jpg"
      alt="EduVault Logo"
      width={finalSize}
      height={finalSize}
      className={`shrink-0 select-none object-contain rounded-xl ${className}`}
      style={{ width: `${finalSize}px`, height: `${finalSize}px` }}
    />
  )
}

export const EduVaultLogo: React.FC<LogoProps> = ({
  className = "",
  iconSize = 92,
  showText = true,
  textSize = "text-2xl"
}) => {
  return (
    <div className={`flex items-center gap-3.5 select-none ${className}`}>
      <EduVaultLogoMark size={iconSize} />
      {showText && (
        <span className={`${textSize} font-black tracking-tight bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent`}>
          EduVault <span className="bg-gradient-to-r from-vault-accent to-vault-cyan bg-clip-text text-transparent">AI</span>
        </span>
      )}
    </div>
  )
}

export default EduVaultLogo
