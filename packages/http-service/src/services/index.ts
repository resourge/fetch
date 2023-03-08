import { BaseHttpService } from './BaseHttpService';
import type { GetMethodConfig, MethodConfig, BaseRequestConfig } from './BaseHttpService'
import LoadingService from './LoadingService';
import QueueKingSystem from './QueueKingSystem';

export {
	type GetMethodConfig, type MethodConfig, 
	type BaseRequestConfig as HttpServiceDefaultConfig,
	BaseHttpService,
	LoadingService,
	QueueKingSystem
}
