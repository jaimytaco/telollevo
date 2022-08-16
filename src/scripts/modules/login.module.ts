const action = async (wf) => {
    const { default: ModAdminAuth } = await import('@modules/admin/auth.module')
    ModAdminAuth.configSignIn(wf)
}

export default{
    action,
}