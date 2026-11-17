<div class="background">
	<span class="hourglass">⏳️</span>
</div>
<style>
	@keyframes spin{
		from{
			transform: rotate(0deg);
		}
		to{
			transform: rotate(360deg);
		}
	}
	
	.hourglass{
		display: inline-block;
		animation: spin 1s linear infinite;
	}
	
	.background{
		cursor: progress;
		backdrop-filter: grayscale(100%);
		background: rgba(0, 0, 0, 0.1);
		position: absolute;
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 9999;
		inset: 0;
	}
</style>