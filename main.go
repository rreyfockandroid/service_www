package main

import (
	"context"
	"fmt"
	"os"
	"os/signal"
	"sync"
	"syscall"
)

func main() {
	fmt.Println("start")
	ctx, cancel := context.WithCancel(context.Background())

	workers := 24
	wg := sync.WaitGroup{}
	f1 := 99959554.4564564564564
	f2 := 24234234.77745454
	loop := 10000
	for i := 0; i < workers; i++ {
		wg.Add(1)
		go func(name int) {
			j := 0
			for {
				j++
				select {
				case <-ctx.Done():
					wg.Done()
					return
				default:
					for i := 0; i < loop; i++ {
						f1 = f1 * f2
						f1 = f1 / f2
						f1 = f1 * f2
						f1 = f1 / f2
						f1 = f1 * f2
						f1 = f1 / f2

					}
					// println(name, " exec ", j)
					// time.Sleep(time.Second * 10)
				}
			}
		}(i)
	}

	go func() {
		signals := make(chan os.Signal, 1)
		signal.Notify(signals, os.Interrupt, syscall.SIGTERM)
		<-signals
		cancel()
	}()

	wg.Wait()
}
