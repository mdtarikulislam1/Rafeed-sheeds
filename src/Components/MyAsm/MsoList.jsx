import React from 'react'
import loadingStore from '../../Zustand/LoadingStore'

export default function MsoList() {
const {setGlobalLoader}=loadingStore()

  return (
    <div>MsoList</div>
  )
}
