import { compose } from "@wsvaio/utils";
import { mergeContext } from "./utils";
import type { AfterPatch, BasicContext, FinalContext } from "./types";
import { AFTERS, BEFORES, ERRORS, FINALS } from "./middleware";

// 基本执行器
export function exec<B extends Record<any, any>, A extends AfterPatch>(
  ctx: BasicContext<B, A>
): FinalContext<B, A> & Promise<FinalContext<B, A>> {
  return mergeContext(
    compose(
      ...BEFORES,
      // @ts-expect-error pass
      ...ctx.befores
      // @ts-expect-error pass
    )(ctx)
      // @ts-expect-error pass
      .then(async () => mergeContext(ctx, await ctx.requester(ctx)))

      .then(() => {
        delete ctx.error;
        // @ts-expect-error pass
        return compose(...AFTERS, ...ctx.afters)(ctx);
      })
      .catch(error => {
        // @ts-expect-error pass
        ctx.error = error;
        // @ts-expect-error pass
        return compose(...ERRORS, ...ctx.errors)(ctx);
      })
      // @ts-expect-error pass
      .finally(() => compose(...FINALS, ...ctx.finals)(ctx)),
    ctx
  );
}
