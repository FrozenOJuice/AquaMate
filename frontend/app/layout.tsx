import React from 'react'
import './globals.css'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import ThemeProvider from '@/components/ThemeProvider'

export const metadata = {
	title: 'AquaMate',
	description: 'A simple root layout for the AquaMate app',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
	return (
		<html lang="en">
			<head />
				<body>
					<ThemeProvider>
						<div className="app-root">
							<Header />

							<main className="site-main">{children}</main>

							<Footer />
						</div>
					</ThemeProvider>
				</body>
		</html>
	)
}
