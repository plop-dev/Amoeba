import { InputOTP, InputOTPGroup, InputOTPSeparator, InputOTPSlot } from '@/components/ui/input-otp';
import { REGEXP_ONLY_DIGITS } from 'input-otp';
import React from 'react';

interface CustomInputOTSProps {
	pattern?: string;
	groups: number[];
}

export function CustomInputOTS({ pattern, groups }: CustomInputOTSProps) {
	let index = 0;

	return (
		<InputOTP maxLength={groups.reduce((a, b) => a + b, 0)} pattern={REGEXP_ONLY_DIGITS}>
			{groups.map((groupSize, groupIndex) => (
				<React.Fragment key={groupIndex}>
					<InputOTPGroup>
						{Array.from({ length: groupSize }).map((_, slotIndex) => (
							<InputOTPSlot key={index} index={index++} />
						))}
					</InputOTPGroup>
					{groupIndex < groups.length - 1 && <InputOTPSeparator />}
				</React.Fragment>
			))}
		</InputOTP>
	);
}
